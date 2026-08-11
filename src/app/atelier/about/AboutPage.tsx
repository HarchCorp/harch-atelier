"use client";

import React from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — ABOUT PAGE
//  « L'intelligence réputationnelle pour le Maroc »
//  Institutional quality · French · DS V2 tokens · Mobile-first
// ═══════════════════════════════════════════════════════════════════════

const STATS = [
  { value: "20+", label: "Sources médias surveillées", sub: "Presse, TV, radio, web" },
  { value: "7 753", label: "Articles analysés", sub: "Au 06/2026" },
  { value: "8", label: "Crises documentées", sub: "Cas d'étude anonymisés" },
  { value: "9", label: "LLM testés", sub: "GPT, Claude, Gemini, Mistral…" },
];

const VALUES = [
  {
    icon: "◎",
    title: "Précision",
    desc: "Chaque score s'appuie sur des sources traçables. Nous indiquons toujours l'article, la date et le moteur IA qui a produit une mention. Aucune donnée ne sort d'une boîte noire.",
  },
  {
    icon: "◆",
    title: "Souveraineté",
    desc: "Architecture pensée pour le Maroc et l'Afrique francophone. Sources locales prioritaires, hébergement conforme, équipe basée à Casablanca.",
  },
  {
    icon: "△",
    title: "Conformité",
    desc: "CNDP, Loi 09-08, traçabilité SHA-256. Toutes les mentions collectées disposent d'une empreinte cryptographique vérifiable.",
  },
  {
    icon: "✦",
    title: "Innovation",
    desc: "9 modèles de langage testés en continu. Notre pipeline intègre les dernières avancées en analyse de sentiment multilingue (FR, AR, Darija).",
  },
];

const TIMELINE = [
  {
    period: "T1 2026",
    title: "Fondation",
    desc: "Harch Corp lance l'activité Atelier à Casablanca. Premier prototype de collecte de mentions sur 5 sources marocaines.",
  },
  {
    period: "T2 2026",
    title: "Premiers clients",
    desc: "Déploiement auprès de 3 entreprises (banque, télécom, grande distribution). Extension à 20+ sources et 4 moteurs IA.",
  },
  {
    period: "T3 2026",
    title: "Industrialisation",
    desc: "Mise en production du pipeline HarchIQ. Alertes WhatsApp, dashboards, rapports PDF board-ready. 7 753 articles analysés cumulés.",
  },
  {
    period: "T4 2026",
    title: "Harch 100",
    desc: "Publication du premier classement Harch 100 — réputation des 100 plus grandes entreprises marocaines. 8 crises documentées.",
  },
];

const TEAM = [
  { name: "Amine Harch El Korane", role: "Fondateur & CEO", initials: "AH" },
  { name: "Équipe Produit", role: "Pipeline & HarchIQ", initials: "PR" },
  { name: "Équipe Analyse", role: "Recherche & scoring", initials: "AN" },
  { name: "Équipe Conformité", role: "CNDP & Loi 09-08", initials: "CO" },
];

const sectionStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "80px 24px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  fontFamily: C.fontMono,
  color: C.accent,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: "16px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "clamp(28px, 4vw, 42px)",
  fontWeight: 700,
  color: C.text,
  fontFamily: C.fontSans,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
  marginBottom: "16px",
};

const bodyStyle: React.CSSProperties = {
  fontSize: "16px",
  color: C.textBody,
  fontFamily: C.fontSans,
  lineHeight: 1.65,
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <AtelierNav />

      <main style={{ flex: 1 }}>
        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section
          style={{
            ...sectionStyle,
            paddingTop: "96px",
            paddingBottom: "64px",
            textAlign: "center",
          }}
        >
          <div style={eyebrowStyle}>À propos · Harch Atelier</div>
          <h1
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              fontWeight: 700,
              color: C.text,
              fontFamily: C.fontSans,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              marginBottom: "24px",
              maxWidth: "920px",
              margin: "0 auto 24px",
            }}
          >
            Harch Atelier — L'intelligence réputationnelle pour le Maroc
          </h1>
          <p
            style={{
              ...bodyStyle,
              fontSize: "19px",
              color: C.textBody,
              maxWidth: "760px",
              margin: "0 auto 32px",
            }}
          >
            Nous surveillons ce que la presse, les réseaux et les moteurs d'IA
            disent de vous. Vous recevez l'analyse, les alertes et les rapports
            pour décider — pas pour réagir.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/atelier/audit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                background: C.cta,
                color: "#FFFFFF",
                fontFamily: C.fontSans,
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s, transform 0.2s",
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
              Demander une démo →
            </a>
            <a
              href="/atelier/method"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                background: "transparent",
                color: C.text,
                border: `1px solid ${C.borderStrong}`,
                fontFamily: C.fontSans,
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.bgHover;
                e.currentTarget.style.borderColor = C.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = C.borderStrong;
              }}
            >
              Voir la méthode
            </a>
          </div>
        </section>

        {/* ─── STATS BAND ────────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "48px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "24px",
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  textAlign: "center",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "44px",
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: C.fontSans,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: C.text,
                    fontFamily: C.fontSans,
                    marginBottom: "4px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: C.textMuted,
                    fontFamily: C.fontMono,
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── MISSION ───────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "48px",
              alignItems: "start",
            }}
          >
            <div>
              <div style={eyebrowStyle}>Notre mission</div>
              <h2 style={headingStyle}>
                Donner aux décideurs marocains la même information que les marchés globaux.
              </h2>
              <p style={{ ...bodyStyle, marginBottom: "16px" }}>
                Trop d'entreprises au Maroc découvrent leur réputation dans la
                presse au moment où elle se dégrade. Trop d'équipes comms
                réagissent au lieu d'anticiper. Trop de boards décident sans
                vision consolidée de leur exposition médiatique et IA.
              </p>
              <p style={{ ...bodyStyle, marginBottom: "16px" }}>
                Harch Atelier corrige ce déséquilibre. Nous collectons en continu
                les mentions de votre entreprise dans 20+ sources marocaines et
                africaines, nous les analysons avec 9 modèles d'IA, et nous
                livrons des indicateurs actionnables — score, alertes, rapports.
              </p>
              <p style={bodyStyle}>
                Basés à Casablanca. Building in Public depuis 2026.
              </p>
            </div>
            <div
              style={{
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "32px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontFamily: C.fontMono,
                  color: C.accent,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                  fontWeight: 700,
                }}
              >
                Ce que nous livrons
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {[
                  "Score de réputation à 5 piliers, mis à jour en continu",
                  "Alertes WhatsApp sur pic de sentiment négatif",
                  "Tableau de bord avec 32 catégories de risque",
                  "Rapport PDF board-ready mensuel",
                  "Veille de la visibilité IA (ChatGPT, Perplexity, Gemini…)",
                  "Empreinte SHA-256 pour traçabilité des sources",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      fontSize: "14px",
                      color: C.text,
                      fontFamily: C.fontSans,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: C.cta,
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── VALUES ────────────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ ...eyebrowStyle, marginBottom: "12px" }}>Valeurs</div>
              <h2 style={{ ...headingStyle, marginBottom: "12px" }}>
                Quatre principes non-négociables
              </h2>
              <p
                style={{
                  ...bodyStyle,
                  maxWidth: "640px",
                  margin: "0 auto",
                }}
              >
                Ils guident chaque ligne de code, chaque alerte, chaque rapport.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: "20px",
              }}
            >
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "28px",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.accent;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      color: C.accent,
                      marginBottom: "16px",
                      lineHeight: 1,
                    }}
                    aria-hidden
                  >
                    {v.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: C.fontSans,
                      marginBottom: "10px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.6,
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TIMELINE ──────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ ...eyebrowStyle, marginBottom: "12px" }}>Trajectoire</div>
            <h2 style={{ ...headingStyle, marginBottom: "12px" }}>
              Quatre trimestres, une plateforme
            </h2>
            <p
              style={{
                ...bodyStyle,
                maxWidth: "640px",
                margin: "0 auto",
              }}
            >
              Construction continue, en public, depuis Casablanca.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: "20px",
            }}
          >
            {TIMELINE.map((t, i) => (
              <div
                key={t.period}
                style={{
                  position: "relative",
                  padding: "24px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  borderTop: `3px solid ${C.accent}`,
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontFamily: C.fontMono,
                    color: C.accent,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")} · {t.period}
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: C.fontSans,
                    marginBottom: "10px",
                  }}
                >
                  {t.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: C.textBody,
                    fontFamily: C.fontSans,
                    lineHeight: 1.55,
                  }}
                >
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TEAM ──────────────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ ...eyebrowStyle, marginBottom: "12px" }}>Équipe</div>
              <h2 style={{ ...headingStyle, marginBottom: "12px" }}>
                Une équipe, quatre pôles
              </h2>
              <p
                style={{
                  ...bodyStyle,
                  maxWidth: "640px",
                  margin: "0 auto",
                }}
              >
                Construire une plateforme d'intelligence réputationnelle exige
                des compétences rares. Les noms individuels sont masqués —
                contactez-nous pour un brief complet.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                gap: "20px",
              }}
            >
              {TEAM.map((m) => (
                <div
                  key={m.name}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "28px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: C.bgSubtle,
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: C.accent,
                      fontFamily: C.fontMono,
                      letterSpacing: "0.05em",
                    }}
                    aria-hidden
                  >
                    {m.initials}
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: C.fontSans,
                      marginBottom: "4px",
                    }}
                  >
                    {m.name}
                  </h3>
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.textMuted,
                      fontFamily: C.fontMono,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BUILDING IN PUBLIC ─────────────────────────────────── */}
        <section style={sectionStyle}>
          <div
            style={{
              background: C.bg,
              borderRadius: "16px",
              padding: "48px 32px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontFamily: C.fontMono,
                color: C.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Building in Public
            </div>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 32px)",
                fontWeight: 700,
                fontFamily: C.fontSans,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
                color: C.text,
              }}
            >
              Chaque changement est documenté. Publiquement.
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: C.textBody,
                fontFamily: C.fontSans,
                maxWidth: "640px",
                lineHeight: 1.6,
                marginBottom: "32px",
              }}
            >
              Pas de release notes cachées. Pas de changelog privé. Chaque fix, chaque feature,
              chaque ajustement de pricing est tracé sur notre page publique Changelog.
              Dernière mise à jour : v3.1.0 — UX hardening (persistance, accessibilité, statut système).
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {[
                { v: "v3.1.0", l: "UX hardening", d: "11 août 2026" },
                { v: "v3.0.0", l: "Tier rename", d: "21 juil. 2026" },
                { v: "v2.4.0", l: "Mega-menu + 16 pages", d: "19 juil. 2026" },
                { v: "v2.3.0", l: "Content expansion", d: "18 juil. 2026" },
              ].map((item) => (
                <a
                  key={item.v}
                  href="/atelier/changelog"
                  style={{
                    display: "block",
                    padding: "16px",
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.accent;
                    e.currentTarget.style.boxShadow = C.shadowSm;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      fontFamily: C.fontMono,
                      color: C.accent,
                      marginBottom: "4px",
                    }}
                  >
                    {item.v}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: C.text,
                      fontFamily: C.fontSans,
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {item.l}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: C.textMuted,
                      fontFamily: C.fontMono,
                    }}
                  >
                    {item.d}
                  </div>
                </a>
              ))}
            </div>
            <a
              href="/atelier/changelog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: C.fontSans,
                color: C.accent,
                textDecoration: "none",
                padding: "10px 20px",
                border: `1px solid ${C.accent}`,
                borderRadius: "8px",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.accent;
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = C.accent;
              }}
            >
              Voir le changelog complet
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        {/* ─── FINAL CTA ─────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div
            style={{
              background: C.bgDarkest,
              borderRadius: "16px",
              padding: "64px 32px",
              textAlign: "center",
              color: C.textOnDark,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                fontFamily: C.fontSans,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
                color: C.textOnDark,
              }}
            >
              Voyez ce que le monde dit de vous.
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: C.textOnDarkBody,
                fontFamily: C.fontSans,
                maxWidth: "560px",
                margin: "0 auto 32px",
                lineHeight: 1.6,
              }}
            >
              Cinq minutes pour la demande. Sept jours pour le premier audit.
              Sans engagement.
            </p>
            <a
              href="/atelier/audit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                background: C.cta,
                color: "#FFFFFF",
                fontFamily: C.fontSans,
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s, transform 0.2s",
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
              Demander une démo →
            </a>
          </div>
        </section>
      </main>

      <div style={{ marginTop: "auto" }}>
        <AtelierFooter />
      </div>
    </div>
  );
}
