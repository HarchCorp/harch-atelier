"use client";

// ═══════════════════════════════════════════════════════════════
//  PitchDeckGenerator
//
//  A 12-slide sales pitch deck carousel — data backed, French,
//  ready to present. When the user clicks "Générer le pitch deck",
//  the popup opens, the API compiles 12 slides with REAL data
//  (reputation score, sentiment, sources, etc.), and the slides
//  appear one by one (500ms delay).
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, sage accent), but the body is a 16:9 slide carousel
//  with ← → navigation, dots, "Slide X / 12" indicator, and an
//  optional play button that auto-advances every 3s.
//
//  Each slide renders differently based on its `type`:
//    • title   — cover slide (big prospect name + tagline)
//    • content — narrative + bullet points / feature cards
//    • data    — stat grid + visualizations (gauge, bars, lists)
//    • pricing — 4 plan mini-cards
//    • cta     — contact info + "Contacter le service commercial"
//
//  Print CSS isolates #pitch-deck-print for window.print() in
//  landscape orientation so the PDF export is clean.
//
//  Skill ID: SKILL-7-PITCH-DECK
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  ChevronLeft, ChevronRight, Play, Pause,
  Presentation, Mail, Phone, MapPin, Globe, Clock,
  ArrowRight, Check,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.2)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";
const NEGATIVE = "#EF4444";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

// ─── Types — mirrors PitchDeckResponse from route.ts ────────────

type SlideType = "title" | "content" | "data" | "pricing" | "cta";

interface PitchSlide {
  number: number;
  title: string;
  type: SlideType;
  content: string;
  data?: Record<string, unknown>;
}

interface PitchDeckData {
  slides: PitchSlide[];
  meta: {
    prospectName: string;
    prospectSector: string | null;
    generatedAt: string;
  };
}

const TOTAL_SLIDES = 12;
const REVEAL_DELAY = 500; // ms between slide reveals
const AUTO_ADVANCE_MS = 3000;

export function PitchDeckGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PitchDeckData | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleCount(0);
    setCurrent(0);
    setAutoPlay(false);
    try {
      const res = await fetch("/api/console/pitch-deck", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const deck = (await res.json()) as PitchDeckData;
      setData(deck);
      setLoading(false);
      // Reveal slides one by one (500ms delay).
      for (let i = 1; i <= deck.slides.length; i++) {
        setTimeout(() => setVisibleCount(i), i * REVEAL_DELAY);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  // ─── Auto-advance logic ──────────────────────────────────────
  useEffect(() => {
    if (!autoPlay || !data) return;
    if (current >= Math.min(visibleCount, TOTAL_SLIDES) - 1) {
      setAutoPlay(false);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      setCurrent((prev) => {
        const max = Math.min(visibleCount, TOTAL_SLIDES) - 1;
        if (prev >= max) {
          setAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, AUTO_ADVANCE_MS);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, data, current, visibleCount]);

  // ─── Keyboard nav (← →) ──────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setCurrent((p) => Math.min(p + 1, Math.max(0, visibleCount - 1)));
      } else if (e.key === "ArrowLeft") {
        setCurrent((p) => Math.max(0, p - 1));
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visibleCount, onClose]);

  const generating = loading || (data !== null && visibleCount < TOTAL_SLIDES);
  const slides = data?.slides ?? [];
  const currentSlide = slides[current] ?? null;
  const maxReached = Math.min(visibleCount, TOTAL_SLIDES);

  function goNext() {
    if (current < maxReached - 1) setCurrent((p) => p + 1);
  }
  function goPrev() {
    if (current > 0) setCurrent((p) => p - 1);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10,10,10,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%",
          maxWidth: 1100,
          maxHeight: "92vh",
          background: WHITE,
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Presentation size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, fontFamily: SANS }}>
              Pitch Deck — Veille Réputationnelle
            </span>
            {generating && !loading && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: SAGE,
                  fontFamily: MONO,
                }}
              >
                <Loader2 size={11} className="animate-spin" /> Génération {visibleCount}/{TOTAL_SLIDES}
              </span>
            )}
            {data && !generating && (
              <span
                style={{
                  fontSize: 11,
                  color: TEXT_MUTED,
                  fontFamily: MONO,
                }}
              >
                {data.meta.prospectName}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => window.print()}
              disabled={generating || !data}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: generating || !data ? BORDER : CHARCOAL,
                color: generating || !data ? TEXT_MUTED : WHITE,
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: generating || !data ? "not-allowed" : "pointer",
                fontFamily: SANS,
              }}
            >
              <Download size={13} /> Exporter PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Slide stage ─── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#FAFAFA",
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2
                size={32}
                style={{ color: SAGE, animation: "spin 1s linear infinite" }}
              />
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: TEXT_MUTED,
                  fontFamily: SANS,
                }}
              >
                Compilation du pitch deck...
              </p>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  color: TEXT_MUTED,
                  fontFamily: MONO,
                }}
              >
                Récupération des données réputationnelles, sources, sentiment.
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: NEGATIVE,
                  fontFamily: SANS,
                }}
              >
                {error}
              </p>
              <button
                onClick={generate}
                style={{
                  marginTop: 16,
                  padding: "8px 16px",
                  background: CHARCOAL,
                  color: WHITE,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: SANS,
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && currentSlide && (
            <div id="pitch-deck-print" style={{ width: "100%", maxWidth: 960 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.number}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: WHITE,
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                    padding: "40px 48px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {renderSlide(currentSlide)}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ─── Navigation footer ─── */}
        {data && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderTop: `1px solid ${BORDER}`,
              background: WHITE,
            }}
          >
            <button
              onClick={goPrev}
              disabled={current === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 12px",
                background: current === 0 ? "transparent" : SAGE_BG,
                color: current === 0 ? TEXT_MUTED : SAGE,
                border: `1px solid ${current === 0 ? BORDER : SAGE_BORDER}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: current === 0 ? "not-allowed" : "pointer",
                fontFamily: SANS,
              }}
            >
              <ChevronLeft size={14} /> Précédent
            </button>

            {/* Dots + slide indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: TOTAL_SLIDES }).map((_, i) => {
                  const isRevealed = i < visibleCount;
                  const isActive = i === current;
                  return (
                    <button
                      key={i}
                      onClick={() => isRevealed && setCurrent(i)}
                      disabled={!isRevealed}
                      aria-label={`Slide ${i + 1}`}
                      style={{
                        width: isActive ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: !isRevealed
                          ? BORDER
                          : isActive
                            ? SAGE
                            : "rgba(74,123,95,0.3)",
                        border: "none",
                        cursor: isRevealed ? "pointer" : "default",
                        transition: "all 0.2s ease",
                        padding: 0,
                      }}
                    />
                  );
                })}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: MONO,
                  color: TEXT_MUTED,
                  minWidth: 80,
                  textAlign: "center",
                }}
              >
                Slide {current + 1} / {TOTAL_SLIDES}
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => setAutoPlay((p) => !p)}
                disabled={current >= maxReached - 1 && !autoPlay}
                title={autoPlay ? "Pause" : "Lecture automatique"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  background: autoPlay ? SAGE : "transparent",
                  color: autoPlay ? WHITE : SAGE,
                  border: `1px solid ${SAGE_BORDER}`,
                  borderRadius: 6,
                  cursor:
                    current >= maxReached - 1 && !autoPlay
                      ? "not-allowed"
                      : "pointer",
                  opacity: current >= maxReached - 1 && !autoPlay ? 0.4 : 1,
                }}
              >
                {autoPlay ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                onClick={goNext}
                disabled={current >= maxReached - 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 12px",
                  background:
                    current >= maxReached - 1 ? "transparent" : CHARCOAL,
                  color: current >= maxReached - 1 ? TEXT_MUTED : WHITE,
                  border: `1px solid ${
                    current >= maxReached - 1 ? BORDER : CHARCOAL
                  }`,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor:
                    current >= maxReached - 1 ? "not-allowed" : "pointer",
                  fontFamily: SANS,
                }}
              >
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          @page { size: landscape; margin: 0; }
          body * { visibility: hidden; }
          #pitch-deck-print, #pitch-deck-print * { visibility: visible; }
          #pitch-deck-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none !important;
          }
          #pitch-deck-print > div {
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  //  SLIDE RENDERERS — one per `type` plus special cases
  // ═══════════════════════════════════════════════════════════════

  function renderSlide(slide: PitchSlide) {
    // Slide-number badge (top-right) on every slide
    const badge = (
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          fontSize: 11,
          fontFamily: MONO,
          color: TEXT_MUTED,
          letterSpacing: "0.08em",
        }}
      >
        {String(slide.number).padStart(2, "0")} / {TOTAL_SLIDES}
      </div>
    );

    let body: React.ReactNode = null;
    switch (slide.number) {
      case 1: body = <SlideTitleContent slide={slide} />; break;
      case 2: body = <SlideProblemContent slide={slide} />; break;
      case 3: body = <SlideMarketContent slide={slide} />; break;
      case 4: body = <SlideSolutionContent slide={slide} />; break;
      case 5: body = <SlideScoreContent slide={slide} />; break;
      case 6: body = <SlideSourcesContent slide={slide} />; break;
      case 7: body = <SlideHarchIQAIContent slide={slide} />; break;
      case 8: body = <SlideSentimentContent slide={slide} />; break;
      case 9: body = <SlideCrisisContent slide={slide} />; break;
      case 10: body = <SlidePricingContent slide={slide} />; break;
      case 11: body = <SlideCaseStudyContent slide={slide} />; break;
      case 12: body = <SlideCtaContent slide={slide} />; break;
      default: body = <SlideGenericContent slide={slide} />;
    }

    return (
      <>
        {badge}
        {body}
      </>
    );
  }
}

// ─── Helper: slide eyebrow + title header ──────────────────────
function SlideHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 10,
          fontFamily: MONO,
          color: SAGE,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          margin: 0,
          color: CHARCOAL,
          letterSpacing: "-0.02em",
          fontFamily: MONO,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─── Slide 1: Title ────────────────────────────────────────────
function SlideTitleContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const prospectName = (d.prospectName as string) ?? "";
  const prospectSector = (d.prospectSector as string) ?? null;
  const date = (d.date as string) ?? "";
  const tagline = (d.tagline as string) ?? "";
  const pitchBy = (d.pitchBy as string) ?? "Harch Atelier";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: MONO,
          color: SAGE,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          marginBottom: 16,
          fontWeight: 700,
        }}
      >
        {pitchBy} · Veille Réputationnelle
      </div>
      <h1
        style={{
          fontSize: 54,
          fontWeight: 700,
          margin: 0,
          color: CHARCOAL,
          letterSpacing: "-0.03em",
          fontFamily: MONO,
          lineHeight: 1.05,
        }}
      >
        {prospectName}
      </h1>
      {prospectSector && (
        <div
          style={{
            marginTop: 12,
            fontSize: 16,
            color: SAGE,
            fontFamily: SANS,
            fontWeight: 500,
          }}
        >
          Secteur : {prospectSector}
        </div>
      )}
      <div
        style={{
          marginTop: 32,
          fontSize: 18,
          color: TEXT_BODY,
          fontFamily: SANS,
          maxWidth: 600,
          lineHeight: 1.5,
        }}
      >
        {tagline}
      </div>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 2,
            background: SAGE,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontFamily: MONO,
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {date}
        </span>
      </div>
    </div>
  );
}

// ─── Slide 2: Problem ──────────────────────────────────────────
function SlideProblemContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const stats = (d.stats as Array<{ value: string; label: string; sublabel: string }>) ?? [];
  const painPoints = (d.painPoints as string[]) ?? [];
  const narrative = (d.narrative as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Contexte" title={slide.title} />
      <p
        style={{
          fontSize: 15,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.55,
          margin: "0 0 18px 0",
          maxWidth: 780,
        }}
      >
        {slide.content}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "12px 14px",
              background: SAGE_BG,
              borderRadius: 8,
              border: `1px solid ${SAGE_BORDER}`,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: SAGE,
                fontFamily: MONO,
                lineHeight: 1.1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: CHARCOAL,
                fontFamily: SANS,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 10,
                color: TEXT_MUTED,
                fontFamily: SANS,
                marginTop: 2,
              }}
            >
              {s.sublabel}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 13,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.55,
          marginBottom: 14,
        }}
      >
        {narrative}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 18px",
        }}
      >
        {painPoints.map((p, i) => (
          <li
            key={i}
            style={{
              fontSize: 12,
              color: TEXT_BODY,
              fontFamily: SANS,
              display: "flex",
              alignItems: "start",
              gap: 6,
            }}
          >
            <span style={{ color: NEGATIVE, fontWeight: 700, flexShrink: 0 }}>—</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Slide 3: Market ───────────────────────────────────────────
function SlideMarketContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const stats = (d.stats as Array<{ value: string; label: string; sublabel: string }>) ?? [];
  const segments = (d.segments as Array<{ name: string; count: number; examples: string }>) ?? [];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Paysage médiatique" title={slide.title} />
      <p
        style={{
          fontSize: 14,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.55,
          margin: "0 0 16px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "14px 12px",
              background: WHITE,
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: MONO,
                lineHeight: 1.1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: TEXT_BODY,
                fontFamily: SANS,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 10,
                color: TEXT_MUTED,
                fontFamily: SANS,
                marginTop: 2,
              }}
            >
              {s.sublabel}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 10,
          fontFamily: MONO,
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        Segments surveillés
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: SAGE_BG,
              borderRadius: 6,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: SAGE,
                fontFamily: MONO,
                minWidth: 28,
              }}
            >
              {seg.count}
            </span>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: CHARCOAL,
                  fontFamily: SANS,
                }}
              >
                {seg.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: TEXT_MUTED,
                  fontFamily: SANS,
                }}
              >
                {seg.examples}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 4: Solution ─────────────────────────────────────────
function SlideSolutionContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const features = (d.features as Array<{ icon: string; title: string; desc: string }>) ?? [];
  const differentiators = (d.differentiators as string[]) ?? [];
  const tagline = (d.tagline as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Notre offre" title={slide.title} />
      <p
        style={{
          fontSize: 14,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.55,
          margin: "0 0 6px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      <div
        style={{
          fontSize: 13,
          color: SAGE,
          fontFamily: SANS,
          fontWeight: 600,
          fontStyle: "italic",
          marginBottom: 16,
        }}
      >
        {tagline}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              padding: "12px 14px",
              background: WHITE,
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: SAGE,
                fontFamily: MONO,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {f.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: TEXT_BODY,
                fontFamily: SANS,
                lineHeight: 1.5,
              }}
            >
              {f.desc}
            </div>
          </div>
        ))}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px 18px",
        }}
      >
        {differentiators.map((p, i) => (
          <li
            key={i}
            style={{
              fontSize: 11,
              color: TEXT_BODY,
              fontFamily: SANS,
              display: "flex",
              alignItems: "start",
              gap: 6,
            }}
          >
            <Check size={12} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Slide 5: Score de réputation (with gauge) ─────────────────
function SlideScoreContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const score = (d.score as number) ?? 0;
  const trend = (d.trend as number) ?? 0;
  const status = (d.status as string) ?? "";
  const breakdown = (d.breakdown as Array<{ label: string; value: number }>) ?? [];
  const narrative = (d.narrative as string) ?? "";
  const updatedAt = (d.updatedAt as string) ?? "";
  const source = (d.source as string) ?? "";

  // Gauge: 0-100 → -90deg to 90deg (180-degree arc)
  const needleAngle = -90 + (score / 100) * 180;
  const scoreColor = score >= 85 ? SAGE : score >= 70 ? SAGE : score >= 55 ? AMBER : NEGATIVE;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Indicateur composite" title={slide.title} />
      <div style={{ display: "flex", gap: 32, flex: 1, alignItems: "center" }}>
        {/* Gauge */}
        <div
          style={{
            position: "relative",
            width: 220,
            height: 130,
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 220 130" width="220" height="130">
            {/* Arc background */}
            <path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke={BORDER}
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Arc fill */}
            <path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 283} 283`}
            />
            {/* Needle */}
            <line
              x1="110"
              y1="120"
              x2="110"
              y2="40"
              stroke={CHARCOAL}
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${needleAngle} 110 120)`}
            />
            <circle cx="110" cy="120" r="6" fill={CHARCOAL} />
          </svg>
          <div
            style={{
              position: "absolute",
              top: 70,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: scoreColor,
                fontFamily: MONO,
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: 10,
                color: TEXT_MUTED,
                fontFamily: MONO,
              }}
            >
              / 100
            </div>
          </div>
        </div>

        {/* Right: status + breakdown */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                padding: "4px 10px",
                background: SAGE_BG,
                border: `1px solid ${SAGE_BORDER}`,
                borderRadius: 4,
                fontSize: 12,
                color: SAGE,
                fontFamily: MONO,
                fontWeight: 700,
              }}
            >
              {status}
            </div>
            <div
              style={{
                fontSize: 13,
                color: trend >= 0 ? SAGE : NEGATIVE,
                fontFamily: SANS,
                fontWeight: 600,
              }}
            >
              {trend >= 0 ? "+" : ""}{trend} pts / 7 jours
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {breakdown.map((b, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 10px",
                  background: WHITE,
                  borderRadius: 6,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: TEXT_MUTED,
                      fontFamily: SANS,
                    }}
                  >
                    {b.label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: CHARCOAL,
                      fontFamily: MONO,
                    }}
                  >
                    {b.value}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: BORDER,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${b.value}%`,
                      background: SAGE,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 11,
              color: TEXT_MUTED,
              fontFamily: SANS,
              lineHeight: 1.5,
            }}
          >
            {narrative}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              color: TEXT_MUTED,
              fontFamily: MONO,
            }}
          >
            Source : {source} · MAJ {updatedAt}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 6: Sources ──────────────────────────────────────────
function SlideSourcesContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const sources = (d.sources as Array<{ name: string; type: string; language: string }>) ?? [];
  const byLanguage = (d.byLanguage as Array<{ lang: string; count: number }>) ?? [];
  const refreshRate = (d.refreshRate as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Couverture" title={slide.title} />
      <p
        style={{
          fontSize: 13,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.55,
          margin: "0 0 14px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 14,
          alignItems: "center",
        }}
      >
        {byLanguage.map((l) => (
          <div
            key={l.lang}
            style={{
              padding: "6px 12px",
              background: SAGE_BG,
              border: `1px solid ${SAGE_BORDER}`,
              borderRadius: 4,
              fontSize: 11,
              color: SAGE,
              fontFamily: MONO,
              fontWeight: 700,
            }}
          >
            {l.lang} · {l.count} sources
          </div>
        ))}
        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: TEXT_MUTED,
            fontFamily: MONO,
          }}
        >
          Refresh : {refreshRate}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          flex: 1,
          alignContent: "start",
        }}
      >
        {sources.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              background: WHITE,
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: SANS,
              }}
            >
              {s.name}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: TEXT_MUTED,
                fontFamily: MONO,
              }}
            >
              <span>{s.type}</span>
              <span
                style={{
                  padding: "1px 5px",
                  background: SAGE_BG,
                  borderRadius: 2,
                  color: SAGE,
                  fontWeight: 700,
                }}
              >
                {s.language}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 7: HarchIQ AI ───────────────────────────────────────
function SlideHarchIQAIContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const capabilities = (d.capabilities as Array<{ icon: string; title: string; desc: string }>) ?? [];
  const quotas = (d.quotas as Array<{ plan: string; briefings: string; queries: string; alertes: string }>) ?? [];
  const tagline = (d.tagline as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Intelligence artificielle" title={slide.title} />
      <p
        style={{
          fontSize: 13,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.5,
          margin: "0 0 6px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      <div
        style={{
          fontSize: 13,
          color: SAGE,
          fontFamily: SANS,
          fontWeight: 600,
          fontStyle: "italic",
          marginBottom: 14,
        }}
      >
        {tagline}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {capabilities.map((c, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              background: WHITE,
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: SAGE,
                fontFamily: MONO,
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {c.title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: TEXT_BODY,
                fontFamily: SANS,
                lineHeight: 1.45,
              }}
            >
              {c.desc}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 10,
          fontFamily: MONO,
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        Quotas par offre
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}
      >
        {quotas.map((q, i) => (
          <div
            key={i}
            style={{
              padding: "8px 10px",
              background: SAGE_BG,
              borderRadius: 6,
              border: `1px solid ${SAGE_BORDER}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: SAGE,
                fontFamily: MONO,
                marginBottom: 4,
              }}
            >
              {q.plan}
            </div>
            <div style={{ fontSize: 10, color: TEXT_BODY, fontFamily: SANS, lineHeight: 1.5 }}>
              <div>Briefings : {q.briefings}</div>
              <div>Requêtes : {q.queries}</div>
              <div>Alertes : {q.alertes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 8: Sentiment (trilingual) ───────────────────────────
function SlideSentimentContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const overall = (d.overall as { positive: number; neutral: number; negative: number }) ?? { positive: 0, neutral: 0, negative: 0 };
  const languages = (d.languages as Array<{ code: string; name: string; sample: string; sentiment: string; count: number }>) ?? [];
  const cascade = (d.cascade as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Moteur trilingue" title={slide.title} />
      <p
        style={{
          fontSize: 13,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.5,
          margin: "0 0 14px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      {/* Sentiment bar */}
      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 5,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div style={{ flex: overall.positive, background: SAGE }} />
        <div style={{ flex: overall.neutral, background: "#E5E5E5" }} />
        <div style={{ flex: overall.negative, background: NEGATIVE }} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 11,
          fontFamily: SANS,
          marginBottom: 16,
        }}
      >
        <span style={{ color: SAGE }}>● {overall.positive}% positif</span>
        <span style={{ color: TEXT_MUTED }}>● {overall.neutral}% neutre</span>
        <span style={{ color: NEGATIVE }}>● {overall.negative}% négatif</span>
      </div>
      {/* Language samples */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {languages.map((l, i) => (
          <div
            key={i}
            style={{
              padding: "12px",
              background: WHITE,
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
              direction: l.code === "AR" ? "rtl" : "ltr",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                direction: "ltr",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: SAGE,
                  fontFamily: MONO,
                  padding: "2px 6px",
                  background: SAGE_BG,
                  borderRadius: 3,
                }}
              >
                {l.code}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: TEXT_MUTED,
                  fontFamily: SANS,
                }}
              >
                {l.count} articles
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: CHARCOAL,
                fontFamily: SANS,
                lineHeight: 1.5,
                marginBottom: 6,
                minHeight: 36,
              }}
            >
              {l.sample}
            </div>
            <div
              style={{
                fontSize: 10,
                color: SAGE,
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 700,
              }}
            >
              ● {l.sentiment}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 12px",
          background: SAGE_BG,
          borderRadius: 6,
          border: `1px solid ${SAGE_BORDER}`,
          fontSize: 11,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.5,
        }}
      >
        {cascade}
      </div>
    </div>
  );
}

// ─── Slide 9: Crisis detection ─────────────────────────────────
function SlideCrisisContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const factors = (d.factors as Array<{ key: string; label: string; desc: string; threshold: string }>) ?? [];
  const alertExample = (d.alertExample as {
    title: string;
    time: string;
    velocity: string;
    sentiment: string;
    sources: string;
    cascade: string;
    recommendation: string;
  }) ?? null;
  const responseTime = (d.responseTime as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Veille active" title={slide.title} />
      <p
        style={{
          fontSize: 13,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.5,
          margin: "0 0 14px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
        {/* Left: factors */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            4 facteurs analysés en continu
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {factors.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 10px",
                  background: WHITE,
                  borderRadius: 6,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: CHARCOAL,
                      fontFamily: SANS,
                    }}
                  >
                    {f.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: NEGATIVE,
                      fontFamily: MONO,
                      fontWeight: 700,
                      padding: "1px 5px",
                      background: "rgba(239,68,68,0.08)",
                      borderRadius: 3,
                    }}
                  >
                    {f.threshold}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: TEXT_MUTED,
                    fontFamily: SANS,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: SAGE,
              fontFamily: MONO,
              fontWeight: 700,
            }}
          >
            Délai d'alerte : {responseTime}
          </div>
        </div>
        {/* Right: alert example */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Exemple d'alerte
          </div>
          {alertExample && (
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(239,68,68,0.04)",
                borderRadius: 8,
                border: `1px solid rgba(239,68,68,0.2)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <AlertTriangle size={14} style={{ color: NEGATIVE }} />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: MONO,
                    color: NEGATIVE,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Alerte crise
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: CHARCOAL,
                  fontFamily: SANS,
                  marginBottom: 4,
                }}
              >
                {alertExample.title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: TEXT_MUTED,
                  fontFamily: MONO,
                  marginBottom: 8,
                }}
              >
                {alertExample.time}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                  fontSize: 11,
                  color: TEXT_BODY,
                  fontFamily: SANS,
                  marginBottom: 8,
                }}
              >
                <div><span style={{ color: TEXT_MUTED }}>Vélocité :</span> {alertExample.velocity}</div>
                <div><span style={{ color: TEXT_MUTED }}>Sentiment :</span> {alertExample.sentiment}</div>
                <div><span style={{ color: TEXT_MUTED }}>Sources :</span> {alertExample.sources}</div>
                <div><span style={{ color: TEXT_MUTED }}>Cascade :</span> {alertExample.cascade}</div>
              </div>
              <div
                style={{
                  padding: "8px 10px",
                  background: WHITE,
                  borderRadius: 4,
                  border: `1px solid ${BORDER}`,
                  fontSize: 11,
                  color: CHARCOAL,
                  fontFamily: SANS,
                }}
              >
                <span style={{ color: SAGE, fontWeight: 700 }}>Recommandation HarchIQ — </span>
                {alertExample.recommendation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 10: Pricing (4 mini cards) ──────────────────────────
function SlidePricingContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const plans = (d.plans as Array<{
    id: string;
    name: string;
    tagline: string;
    persona: string;
    price: string;
    priceHint: string;
    features: string[];
    highlight: boolean;
  }>) ?? [];
  const note = (d.note as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Offres" title={slide.title} />
      <p
        style={{
          fontSize: 12,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.5,
          margin: "0 0 14px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          flex: 1,
        }}
      >
        {plans.map((p, i) => (
          <div
            key={i}
            style={{
              padding: "12px 12px",
              background: p.highlight ? SAGE_BG : WHITE,
              borderRadius: 8,
              border: `1px solid ${p.highlight ? SAGE : BORDER}`,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {p.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "2px 8px",
                  background: SAGE,
                  color: WHITE,
                  fontSize: 9,
                  fontFamily: MONO,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderRadius: 3,
                  whiteSpace: "nowrap",
                }}
              >
                Recommandé
              </div>
            )}
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: MONO,
                marginBottom: 2,
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: SAGE,
                fontFamily: SANS,
                fontStyle: "italic",
                marginBottom: 6,
              }}
            >
              {p.tagline}
            </div>
            <div
              style={{
                fontSize: 10,
                color: TEXT_MUTED,
                fontFamily: SANS,
                marginBottom: 8,
              }}
            >
              {p.persona}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: MONO,
                marginBottom: 2,
              }}
            >
              {p.price}
            </div>
            <div
              style={{
                fontSize: 9,
                color: TEXT_MUTED,
                fontFamily: SANS,
                marginBottom: 10,
              }}
            >
              {p.priceHint}
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flex: 1,
              }}
            >
              {p.features.map((f, j) => (
                <li
                  key={j}
                  style={{
                    fontSize: 10,
                    color: TEXT_BODY,
                    fontFamily: SANS,
                    display: "flex",
                    alignItems: "start",
                    gap: 4,
                    lineHeight: 1.4,
                  }}
                >
                  <Check size={10} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 10,
          color: TEXT_MUTED,
          fontFamily: SANS,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        {note}
      </div>
    </div>
  );
}

// ─── Slide 11: Case study ──────────────────────────────────────
function SlideCaseStudyContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const sector = (d.sector as string) ?? "";
  const challenge = (d.challenge as string) ?? "";
  const solution = (d.solution as string) ?? "";
  const timeline = (d.timeline as Array<{ time: string; event: string }>) ?? [];
  const outcome = (d.outcome as Array<{ metric: string; value: string }>) ?? [];
  const testimonial = (d.testimonial as { quote: string; author: string; anonymized: boolean }) ?? null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow={`Cas anonymisé · secteur ${sector}`} title={slide.title} />
      <p
        style={{
          fontSize: 12,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.5,
          margin: "0 0 14px 0",
          maxWidth: 800,
        }}
      >
        {slide.content}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
        {/* Left: challenge + solution + timeline */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: NEGATIVE,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
              fontWeight: 700,
            }}
          >
            Défi
          </div>
          <div
            style={{
              fontSize: 11,
              color: TEXT_BODY,
              fontFamily: SANS,
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            {challenge}
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: SAGE,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
              fontWeight: 700,
            }}
          >
            Solution Harch
          </div>
          <div
            style={{
              fontSize: 11,
              color: TEXT_BODY,
              fontFamily: SANS,
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            {solution}
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Chronologie
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {timeline.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 10,
                  fontFamily: SANS,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    color: SAGE,
                    fontWeight: 700,
                    minWidth: 50,
                  }}
                >
                  {t.time}
                </span>
                <span style={{ color: TEXT_BODY, flex: 1 }}>{t.event}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Right: outcome metrics + testimonial */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Résultats
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              marginBottom: 14,
            }}
          >
            {outcome.map((o, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  background: SAGE_BG,
                  borderRadius: 6,
                  border: `1px solid ${SAGE_BORDER}`,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: SAGE,
                    fontFamily: MONO,
                    lineHeight: 1.1,
                  }}
                >
                  {o.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: TEXT_BODY,
                    fontFamily: SANS,
                    marginTop: 2,
                  }}
                >
                  {o.metric}
                </div>
              </div>
            ))}
          </div>
          {testimonial && (
            <div
              style={{
                padding: "12px 14px",
                background: WHITE,
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${SAGE}`,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: CHARCOAL,
                  fontFamily: SANS,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                « {testimonial.quote} »
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: TEXT_MUTED,
                  fontFamily: MONO,
                }}
              >
                — {testimonial.author}
                {testimonial.anonymized && " · Identité préservée"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 12: Contact CTA ─────────────────────────────────────
function SlideCtaContent({ slide }: { slide: PitchSlide }) {
  const d = slide.data ?? {};
  const contact = (d.contact as {
    email: string;
    phone: string;
    address: string;
    website: string;
    hours: string;
  }) ?? { email: "", phone: "", address: "", website: "", hours: "" };
  const nextSteps = (d.nextSteps as string[]) ?? [];
  const ctaLabel = (d.ctaLabel as string) ?? "Contacter le service commercial";
  const ctaHint = (d.ctaHint as string) ?? "";
  const closingNote = (d.closingNote as string) ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow="Prochaine étape" title={slide.title} />
      <p
        style={{
          fontSize: 16,
          color: CHARCOAL,
          fontFamily: SANS,
          lineHeight: 1.5,
          margin: "0 0 18px 0",
          maxWidth: 700,
          fontWeight: 500,
        }}
      >
        {slide.content}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1 }}>
        {/* Left: contact methods */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Contact
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ContactRow icon={<Mail size={14} />} label={contact.email} />
            <ContactRow icon={<Phone size={14} />} label={contact.phone} />
            <ContactRow icon={<Globe size={14} />} label={contact.website} />
            <ContactRow icon={<MapPin size={14} />} label={contact.address} />
            <ContactRow icon={<Clock size={14} />} label={contact.hours} />
          </div>
          <a
            href={`mailto:${contact.email}`}
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: CHARCOAL,
              color: WHITE,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: SANS,
              textDecoration: "none",
            }}
          >
            {ctaLabel} <ArrowRight size={14} />
          </a>
          {ctaHint && (
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                color: TEXT_MUTED,
                fontFamily: SANS,
              }}
            >
              {ctaHint}
            </div>
          )}
        </div>
        {/* Right: next steps */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: TEXT_MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Prochaines étapes
          </div>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {nextSteps.map((step, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 12,
                  color: TEXT_BODY,
                  fontFamily: SANS,
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: SAGE_BG,
                    color: SAGE,
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ paddingTop: 3 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: `1px solid ${BORDER}`,
          fontSize: 10,
          color: TEXT_MUTED,
          fontFamily: MONO,
          textAlign: "center",
          letterSpacing: "0.05em",
        }}
      >
        {closingNote}
      </div>
    </div>
  );
}

function ContactRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        color: CHARCOAL,
        fontFamily: SANS,
      }}
    >
      <span style={{ color: SAGE, display: "flex", alignItems: "center" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Generic fallback (unused — all 12 slides have dedicated renderers) ──
function SlideGenericContent({ slide }: { slide: PitchSlide }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SlideHeader eyebrow={`Slide ${slide.number}`} title={slide.title} />
      <p
        style={{
          fontSize: 14,
          color: TEXT_BODY,
          fontFamily: SANS,
          lineHeight: 1.6,
        }}
      >
        {slide.content}
      </p>
    </div>
  );
}
