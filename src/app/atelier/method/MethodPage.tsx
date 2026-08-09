"use client";

import React from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — METHOD PAGE
//  « De l'article source au score board-ready. »
//  Pipeline 5 étapes · 5 piliers de scoring · Conformité CNDP / 09-08 / ISO
// ═══════════════════════════════════════════════════════════════════════

const PIPELINE = [
  {
    num: "01",
    title: "Collection",
    desc: "Collecte continue depuis 20+ sources marocaines et africaines : presse nationale, presse régionale, TV, radio, web. Crawls dédiés, APIs éditeurs, flux RSS. Chaque article est horodaté et empreinte SHA-256.",
    tags: ["20+ sources", "Crawl dédié", "SHA-256"],
  },
  {
    num: "02",
    title: "Preprocessing",
    desc: "Normalisation linguistique (FR, AR, Darija), déduplication, extraction d'entités (ORG, PER, LOC), segmentation par paragraphes. Préparation des payloads pour les LLM.",
    tags: ["FR + AR + Darija", "NER", "Déduplication"],
  },
  {
    num: "03",
    title: "AI Analysis",
    desc: "Analyse par 9 modèles de langage testés en continu : ChatGPT, Claude, Gemini, Mistral, Perplexity, Copilot, Grok, etc. Sentiment, catégorie de risque (32 catégories), tonalité, intention.",
    tags: ["9 LLM", "32 catégories", "Sentiment multilingue"],
  },
  {
    num: "04",
    title: "Scoring",
    desc: "Agrégation en score de réputation à 5 piliers pondérés. Comparaison vs concurrents, calcul du delta hebdomadaire, détection des dérives et des signaux faibles.",
    tags: ["5 piliers", "Benchmark concurrents", "Signaux faibles"],
  },
  {
    num: "05",
    title: "Alert",
    desc: "Distribution multi-canal : alertes WhatsApp temps réel, dashboard, brief exécutif hebdo, rapport PDF board-ready mensuel. Empreinte SHA-256 sur chaque livrable.",
    tags: ["WhatsApp", "Dashboard", "PDF board-ready"],
  },
];

const SOURCES = [
  { type: "Presse nationale", items: ["Le Matin", "L'Économiste", "Aujourd'hui le Maroc", "Les Inspirations ÉCO", "Medias24", "Hespress", "TelQuel"] },
  { type: "Presse régionale", items: ["La Nouvelle Tribune", "Le Reporter", "Bayane Al Yaoume", "Al Massae", "Al Akhbar"] },
  { type: "TV & Radio", items: ["2M", "RTM / SNRT", "Médi1 TV", "Radio Atlas", "Chaine Inter"] },
  { type: "Web & Agences", items: ["MAP", "Bladi.net", "Yabiladi", "Lnt.ma", "Barlamane.com"] },
];

const PILLARS = [
  {
    name: "Réputation",
    weight: 30,
    desc: "Volume et qualité des mentions médiatiques. Share of voice, tonalité, crédibilité des sources.",
    color: C.cta,
  },
  {
    name: "Sentiment",
    weight: 25,
    desc: "Polarité des mentions (positif, neutre, négatif), par entité, par média, par période. Détection des dérives.",
    color: C.accent,
  },
  {
    name: "Visibilité IA",
    weight: 20,
    desc: "Ce que 9 moteurs IA (ChatGPT, Perplexity, Gemini…) répondent à propos de l'entité. Tendances et écarts vs concurrents.",
    color: C.warning,
  },
  {
    name: "Diversité",
    weight: 15,
    desc: "Distribution des sources (presse / TV / radio / web / social / IA). Une réputation concentrée sur un canal est fragile.",
    color: "#8b5cf6",
  },
  {
    name: "Résilience",
    weight: 10,
    desc: "Capacité de la marque à absorber un choc médiatique. Historique de crises, vitesse de récupération, amplitude des pics négatifs.",
    color: C.danger,
  },
];

const COMPLIANCE = [
  {
    label: "CNDP",
    title: "Commission Nationale de contrôle des Données à caractère Personnel",
    desc: "Conformité aux recommandations de la CNDP marocaine. Minimisation des données personnelles, finalité claire, droit d'accès et de rectification.",
    points: ["Minimisation", "Droit d'accès", "Finalité documentée"],
  },
  {
    label: "Loi 09-08",
    title: "Protection des personnes physiques",
    desc: "Application de la loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.",
    points: ["Consentement", "Hébergement conforme", "DPO désigné"],
  },
  {
    label: "ISO 27001",
    title: "Management de la sécurité de l'information",
    desc: "Démarche alignée sur les exigences ISO/IEC 27001. Politique de sécurité, gestion des risques, contrôles d'accès, journalisation.",
    points: ["Politique sécurité", "Contrôles d'accès", "Journalisation"],
  },
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

export default function MethodPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <AtelierNav />

      <main style={{ flex: 1 }}>
        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section style={{ ...sectionStyle, paddingTop: "96px", paddingBottom: "48px", textAlign: "center" }}>
          <div style={eyebrowStyle}>Méthode · Harch Atelier</div>
          <h1
            style={{
              fontSize: "clamp(36px, 5.5vw, 56px)",
              fontWeight: 700,
              color: C.text,
              fontFamily: C.fontSans,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "20px",
              maxWidth: "900px",
              margin: "0 auto 20px",
            }}
          >
            De l'article source au score board-ready.
          </h1>
          <p
            style={{
              ...bodyStyle,
              fontSize: "19px",
              maxWidth: "720px",
              margin: "0 auto 32px",
            }}
          >
            Cinq étapes, cinq piliers, trois cadres de conformité. Toute
            mention que nous livrons est traçable, datée et vérifiable.
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
              href="/atelier/pricing"
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
              Voir les tarifs
            </a>
          </div>
        </section>

        {/* ─── PIPELINE ──────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={{ marginBottom: "48px" }}>
            <div style={eyebrowStyle}>Pipeline</div>
            <h2 style={headingStyle}>Cinq étapes, du crawl à l'alerte</h2>
            <p style={{ ...bodyStyle, maxWidth: "640px" }}>
              Chaque étape est instrumentée, journalisée et vérifiable.
              Aucune donnée ne sort d'une boîte noire.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {PIPELINE.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(80px, 120px) 1fr",
                  gap: "24px",
                  padding: "28px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  position: "relative",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    borderRight: `1px solid ${C.border}`,
                    paddingRight: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "40px",
                      fontWeight: 700,
                      color: C.accent,
                      fontFamily: C.fontMono,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {step.num}
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div
                      style={{
                        marginTop: "12px",
                        width: "1px",
                        height: "24px",
                        background: C.border,
                      }}
                      aria-hidden
                    />
                  )}
                </div>
                <div>
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
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.6,
                      marginBottom: "14px",
                    }}
                  >
                    {step.desc}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {step.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: "4px 10px",
                          background: C.bgSubtle,
                          border: `1px solid ${C.border}`,
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontFamily: C.fontMono,
                          color: C.textBody,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DATA SOURCES ──────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ marginBottom: "40px" }}>
              <div style={eyebrowStyle}>Sources de données</div>
              <h2 style={headingStyle}>20+ sources marocaines</h2>
              <p style={{ ...bodyStyle, maxWidth: "640px" }}>
                Presse nationale, presse régionale, TV, radio, web et agences.
                Liste non-exhaustive, évolutive.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: "20px",
              }}
            >
              {SOURCES.map((s) => (
                <div
                  key={s.type}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontFamily: C.fontMono,
                      color: C.accent,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: "14px",
                      fontWeight: 700,
                      paddingBottom: "10px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {s.type}
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {s.items.map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          fontSize: "13px",
                          color: C.text,
                          fontFamily: C.fontSans,
                        }}
                      >
                        <span
                          style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: C.accent,
                            flexShrink: 0,
                          }}
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "24px",
                padding: "16px 20px",
                background: C.bg,
                border: `1px dashed ${C.borderStrong}`,
                borderRadius: "8px",
                fontSize: "13px",
                color: C.textMuted,
                fontFamily: C.fontSans,
                textAlign: "center",
              }}
            >
              + Réseaux sociaux (X, LinkedIn, Facebook) · + 9 moteurs IA · + sources sectorielles sur demande
            </div>
          </div>
        </section>

        {/* ─── SCORING PILLARS ───────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={{ marginBottom: "40px" }}>
            <div style={eyebrowStyle}>Scoring</div>
            <h2 style={headingStyle}>Cinq piliers, 100 %</h2>
            <p style={{ ...bodyStyle, maxWidth: "640px" }}>
              Le score de réputation Harch combine cinq dimensions pondérées.
              Chaque pilier est calculé en continu, à partir de mentions traçables.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {PILLARS.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: "24px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  display: "grid",
                  gridTemplateColumns: "minmax(140px, 180px) 1fr minmax(80px, 100px)",
                  gap: "24px",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: C.fontSans,
                      marginBottom: "6px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: p.color,
                      fontFamily: C.fontMono,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {p.weight}%
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: C.textBody,
                    fontFamily: C.fontSans,
                    lineHeight: 1.6,
                  }}
                >
                  {p.desc}
                </p>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: C.bgSubtle,
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                  aria-hidden
                >
                  <div
                    style={{
                      width: `${p.weight}%`,
                      height: "100%",
                      background: p.color,
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "24px",
              padding: "16px 20px",
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              fontSize: "13px",
              color: C.textBody,
              fontFamily: C.fontSans,
            }}
          >
            <strong style={{ color: C.text }}>
              Note méthodologique :
            </strong>{" "}
            Les pondérations sont calibrées sur les pratiques de référence en
            intelligence réputationnelle et ajustées au contexte marocain. Elles
            sont stables sur 12 mois et publiées dans chaque rapport.
          </div>
        </section>

        {/* ─── COMPLIANCE ────────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ marginBottom: "40px" }}>
              <div style={eyebrowStyle}>Conformité</div>
              <h2 style={headingStyle}>CNDP · Loi 09-08 · ISO 27001</h2>
              <p style={{ ...bodyStyle, maxWidth: "640px" }}>
                Trois cadres structurent notre pratique. Chaque livrable est
                traçable, chaque source est horodatée, chaque accès est journalisé.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: "20px",
              }}
            >
              {COMPLIANCE.map((c) => (
                <div
                  key={c.label}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "28px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 14px",
                      background: C.bgSubtle,
                      border: `1px solid ${C.accent}`,
                      color: C.accent,
                      fontSize: "12px",
                      fontFamily: C.fontMono,
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      borderRadius: "4px",
                      marginBottom: "16px",
                    }}
                  >
                    {c.label}
                  </div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: C.fontSans,
                      marginBottom: "10px",
                      lineHeight: 1.4,
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.6,
                      marginBottom: "16px",
                    }}
                  >
                    {c.desc}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {c.points.map((p) => (
                      <span
                        key={p}
                        style={{
                          padding: "4px 10px",
                          background: C.bgSubtle,
                          border: `1px solid ${C.border}`,
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontFamily: C.fontMono,
                          color: C.textBody,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ───────────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div
            style={{
              background: C.bgDarkest,
              borderRadius: "16px",
              padding: "56px 32px",
              textAlign: "center",
              color: C.textOnDark,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 36px)",
                fontWeight: 700,
                fontFamily: C.fontSans,
                letterSpacing: "-0.02em",
                marginBottom: "14px",
                color: C.textOnDark,
              }}
            >
              Voyez votre score.
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: C.textOnDarkBody,
                fontFamily: C.fontSans,
                maxWidth: "560px",
                margin: "0 auto 28px",
                lineHeight: 1.6,
              }}
            >
              30 minutes de démo pour comprendre comment chaque pilier s'applique
              à votre entreprise.
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
