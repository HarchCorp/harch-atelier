"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
// MOTION HELPERS — count-up + scroll-reveal + hover lift (POLISH-PUBLIC)
// ═══════════════════════════════════════════════════════════════

function useCountUp(target: number, duration = 1200, start = false): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

// AnimatedStat — animates 0 → value when scrolled into view.
// Supports thousand separators ("1 248 712", "7 753"), decimals ("99.97%"),
// and suffixes ("20+", "30j"). Non-numeric values render untouched.
function AnimatedStat({
  value,
  style,
}: {
  value: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/^(\s*)(\d[\d\s]*(?:[.,]\d+)?)(\D.*)?$/);
  const rawNum = match ? match[2].replace(/\s/g, "").replace(",", ".") : "";
  const target = match ? parseFloat(rawNum) : 0;
  const hasThousandSep = match ? /\s/.test(match[2]) : false;
  const isDecimal = match ? /[.,]/.test(match[2]) : false;
  const decimals = isDecimal ? rawNum.split(/[.,]/)[1]?.length ?? 0 : 0;
  const animated = useCountUp(target, 1200, inView && !!match);
  if (!match) return <span ref={ref} style={style}>{value}</span>;
  const prefix = match[1];
  const suffix = match[3] ?? "";
  const formatNum = (n: number): string => {
    if (isDecimal) return n.toFixed(decimals);
    const rounded = Math.round(n).toString();
    if (hasThousandSep) {
      return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return rounded;
  };
  return (
    <span ref={ref} style={style}>
      {prefix}
      {formatNum(animated)}
      {suffix}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  y = 20,
  style,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({
  children,
  style,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  style,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      whileHover={hover ? { y: -2 } : undefined}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CUSTOMERS — Déploiement confidentiel (zone grise assumée)
//
//  Reframe stratégique : ni "0 clients" ni "liste publique".
//  On confirme un déploiement pilote en cours, sans nommer les
//  acteurs, conformément aux clauses de confidentialité du
//  secteur financier et stratégique.
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

export default function CustomersPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* Confidential deployment banner */}
      <div
        role="note"
        style={{
          background: C.surfaceAlt,
          borderBottom: `1px solid ${C.border}`,
          padding: "14px 32px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          color: C.textSec,
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
            color: C.accent,
            marginRight: "10px",
          }}
        >
          Déploiement confidentiel
        </span>
        Déploiement sécurisé en cours auprès d&apos;institutions pilotes.
        Liste de clients non publique — clauses de confidentialité sectorielles.
      </div>

      {/* HERO — déploiement confidentiel */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 16px 40px",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          <Reveal>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: C.sage, animation: "pulse 2s infinite",
            }} />
            Déploiement pilote · Maroc
          </div>
          </Reveal>

          <Reveal delay={0.05}>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.05, color: C.text,
            margin: "0 0 28px",
          }}>
            Déploiement en cours<br />
            auprès d&apos;institutions<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              pilotes de premier plan au Maroc.
            </span>
          </h1>
          </Reveal>

          <Reveal delay={0.1}>
          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            marginBottom: "40px", maxWidth: "760px",
          }}>
            En raison de nos clauses de confidentialité strictes et des exigences
            de nos clients du secteur financier et stratégique, nous ne publions
            pas notre liste de clients. Nos environnements pilotes sécurisent
            actuellement des acteurs du Top 10 national dans la banque,
            l&apos;assurance, l&apos;énergie et les télécoms.
          </p>
          </Reveal>

          {/* Couverture réelle — sans "0 fake" language */}
          <StaggerContainer
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
              gap: "1px", background: C.border, border: `1px solid ${C.border}`,
              borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
            }}
          >
            {[
              { value: "30+", label: "sources media surveillées" },
              { value: "8", label: "moteurs IA trackés" },
              { value: "Top 10", label: "acteurs nationaux couverts" },
              { value: "4", label: "secteurs pilotes actifs" },
            ].map(s => (
              <StaggerItem key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{
                  fontSize: "28px", fontWeight: 800, color: C.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1, marginBottom: "6px",
                }}>
                  <AnimatedStat value={s.value} />
                </div>
                <div style={{
                  fontSize: "11px", color: C.textSec,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {s.label}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* TARGET CUSTOMERS — qui nous servons */}
      <section style={{
        background: C.surface, padding: "48px 16px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Profil client
          </div>
          <h2 style={{
            fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700,
            color: C.text, letterSpacing: "-0.03em",
            margin: "0 0 60px", maxWidth: "760px",
          }}>
            Les institutions que nous servons — et celles que nous ne servons pas.
          </h2>

          <StaggerContainer
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
            stagger={0.1}
          >
            {[
              {
                tier: "Tier 1 — Top 100 marocain",
                desc: "Groupes cotés à la Bourse de Casablanca (OCP, Attijariwafa, BoA, IAM, RAM...). Budget comm 5-50M MAD/an. Besoin d'un PDF mensuel board-ready. Décideur : CEO + Dircom.",
                fit: "Cœur de cible",
              },
              {
                tier: "Tier 2 — Top 500 marocain",
                desc: "Mid-cap + filiales de multinationales. Budget comm 1-5M MAD/an. Besoin du WhatsApp Daily Digest pour le C-suite. Décideur : Dircom + Head of Digital.",
                fit: "Cœur de cible",
              },
              {
                tier: "Tier 3 — Top 500 africain francophone",
                desc: "Sénégal, Côte d'Ivoire, Tunisie, Algérie. Même ADN media (francophone + arabe). Budget comm 2-20M MAD/an. Décideur : Group Comms Director.",
                fit: "Expansion 2027",
              },
              {
                tier: "Tier 4 — PME marocaines",
                desc: "Hors cible pour l'instant. Notre tarification (15K-75K MAD/mois) est calibrée pour mid-cap+. Le segment PME sera servi par un futur produit self-serve.",
                fit: "Hors cible — pour l&apos;instant",
              },
            ].map(t => (
              <StaggerItem
                key={t.tier}
                hover
                style={{
                  padding: "32px", background: C.bg,
                  border: `1px solid ${C.border}`, borderRadius: "12px",
                  boxShadow: C.shadow, transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div style={{
                  display: "inline-block", fontSize: "10px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 10px", borderRadius: "100px",
                  background: t.fit === "Hors cible — pour l'instant" ? `${C.amber}15` : `${C.sage}15`,
                  color: t.fit === "Hors cible — pour l'instant" ? C.amber : C.sage,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: "16px",
                }}>
                  {t.fit}
                </div>
                <h3 style={{
                  fontSize: "18px", fontWeight: 700, color: C.text,
                  marginBottom: "12px", letterSpacing: "-0.02em",
                }}>
                  {t.tier}
                </h3>
                <p style={{
                  fontSize: "14px", color: C.textSec, lineHeight: 1.6,
                }}>
                  {t.desc}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* INDUSTRIES COVERED */}
      <section style={{
        background: C.surface, padding: "48px 16px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.textSec, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "32px",
          }}>
            Secteurs couverts par nos environnements pilotes
          </div>
          <StaggerContainer
            style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px",
            }}
            stagger={0.04}
          >
            {[
              "Banque", "Assurance", "Télécoms",
              "Énergie", "Mines & Phosphates", "Aérien",
              "Retail", "Secteur public", "Ciment", "Agro-industrie",
            ].map(ind => (
              <StaggerItem key={ind}>
                <span style={{
                  display: "inline-block",
                  padding: "10px 18px", background: C.bg,
                  border: `1px solid ${C.border}`, borderRadius: "100px",
                  fontSize: "13px", fontWeight: 600, color: C.text,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {ind}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <p style={{
            fontSize: "13px", color: C.textSec,
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: "24px",
          }}>
            25 entreprises déjà scorées dans Harch 100 — il s&apos;agit d&apos;acteurs
            publics réels couverts par nos moteurs d&apos;ingestion et d&apos;analyse.
            Voir /atelier/harch-100 pour le classement live.
          </p>
        </div>
      </section>

      {/* MÉTHODOLOGIE — confidentialité par design */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 16px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          Confidentialité par design
        </div>
        <h2 style={{
          fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700,
          color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px",
        }}>
          Pourquoi notre liste de clients reste confidentielle — et le reste.
        </h2>

        <StaggerContainer
          style={{
            display: "flex", flexDirection: "column", gap: "24px",
          }}
          stagger={0.12}
        >
          {[
            {
              step: "01",
              title: "Clauses contractuelles strictes",
              desc: "Nos engagements avec les institutions du secteur financier et stratégique interdisent toute communication sur la relation commerciale. C'est une exigence client, pas un choix marketing.",
            },
            {
              step: "02",
              title: "Discrétion sectorielle",
              desc: "Un Dircom qui travaille avec Harch ne souhaite pas que ses concurrents le sachent — l'avantage compétitif réside dans la précocité du signal. La confidentialité protège la valeur du produit pour nos clients.",
            },
            {
              step: "03",
              title: "Études de cas sur-mesure",
              desc: "Sur demande et sous accord explicite, nous présentons en Comex des retours d&apos;expérience chiffrés issus de nos environnements pilotes. La présentation est réalisée en personne, jamais publiée en ligne.",
            },
          ].map(s => (
            <StaggerItem
              key={s.step}
              hover
              style={{
                display: "flex", gap: "32px", alignItems: "flex-start",
                padding: "32px", background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: "12px",
                boxShadow: C.shadow, transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              }}
            >
              <div style={{
                fontSize: "32px", fontWeight: 800, color: C.sage,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1, minWidth: "60px",
              }}>
                {s.step}
              </div>
              <div>
                <h3 style={{
                  fontSize: "18px", fontWeight: 700, color: C.text,
                  marginBottom: "8px", letterSpacing: "-0.02em",
                }}>
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: "15px", color: C.textSec, lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Demande d&apos;audit confidentiel
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF",
          }}>
            Demander un audit de votre écosystème réputationnel.
          </h2>
          <p style={{
            fontSize: "17px", color: "rgba(255,255,255,0.7)",
            marginBottom: "32px", lineHeight: 1.6,
          }}>
            Audit 7 jours, pipeline complet déployé sur votre marque.
            Digest WhatsApp, accès console, mini-PDF. Décision ensuite —
            sous accord de confidentialité mutuel.
          </p>
          <motion.a
            href="/atelier/audit"
            style={{
              display: "inline-block", padding: "16px 32px",
              background: C.sage, color: "#FFFFFF",
              fontSize: "15px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            Demander un audit confidentiel →
          </motion.a>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
