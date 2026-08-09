"use client";

import React from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — SOLUTIONS PAGE
//  « Quatre problèmes. Une plateforme. »
// ═══════════════════════════════════════════════════════════════════════

const CAPABILITIES = [
  {
    icon: "📡",
    title: "Veille médiatique",
    desc: "20+ sources marocaines et africaines surveillées en continu. Presse nationale, presse régionale, TV, radio, web — chaque mention est collectée, horodatée et empreinte SHA-256.",
    points: ["20+ sources", "Temps réel", "Empreinte cryptographique"],
  },
  {
    icon: "💬",
    title: "Social listening",
    desc: "Surveillance des réseaux sociaux (X, LinkedIn, Facebook) et des forums. Détection des signaux faibles, des hashtags émergents et des influenceurs qui parlent de vous.",
    points: ["Réseaux sociaux", "Détection signaux faibles", "Cartographie influenceurs"],
  },
  {
    icon: "🤖",
    title: "Visibilité IA",
    desc: "Ce que ChatGPT, Perplexity, Gemini, Copilot, Claude, Mistral et Grok disent de vous. 9 moteurs IA testés en continu. Vous voyez votre marque comme la verront vos clients demain.",
    points: ["9 moteurs IA", "Tests hebdomadaires", "Comparaison concurrents"],
  },
  {
    icon: "📰",
    title: "Relations médias",
    desc: "Suivi de votre share of voice vs concurrents. Identification des journalistes qui parlent de votre secteur. Mesure d'impact de vos campagnes RP et de vos communiqués.",
    points: ["Share of voice", "Cartographie journalistes", "Mesure d'impact RP"],
  },
  {
    icon: "⭐",
    title: "Marketing d'influence",
    desc: "Identification des influenceurs pertinents pour votre marque, suivi de leurs mentions, calcul du ROI de vos campagnes d'influence. Détection des faux engagement et faux followers.",
    points: ["Identification influenceurs", "Suivi mentions", "Détection fraude"],
  },
];

const PROBLEMS = [
  {
    problem: "Vous découvrez votre crise dans la presse",
    before: "Découverte 48h après l'article. Réaction désordonnée.",
    after: "Alerte WhatsApp < 15 min après publication. Plan de communication déclenché immédiatement.",
    features: ["Alertes temps réel", "Détection pic négatif", "Historique traçable"],
  },
  {
    problem: "Vous ignorez ce que les IA disent de vous",
    before: "ChatGPT, Perplexity, Gemini — aveugle à 9 canaux majeurs.",
    after: "Rapport mensuel « Visibilité IA » avec comparaison vs concurrents et tendances.",
    features: ["9 moteurs IA", "Tests hebdomadaires", "Benchmark concurrentiel"],
  },
  {
    problem: "Vous ne mesurez pas l'impact de vos RP",
    before: "Comptage manuel d'articles. Pas de benchmark. Pas de sentiment.",
    after: "Share of voice, sentiment par article, score d'impact par média. Mesure continue.",
    features: ["Share of voice", "Sentiment par article", "Score d'impact média"],
  },
  {
    problem: "Votre board décide sans vision réputationnelle",
    before: "Pas de KPI consolidé. Décisions à l'instinct.",
    after: "Score de réputation à 5 piliers, mis à jour en continu. Rapport PDF board-ready mensuel.",
    features: ["Score 5 piliers", "Rapport board-ready", "Tendances 12 mois"],
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect",
    desc: "Nous configurons vos entités, sources et concurrents. 20+ sources marocaines, 9 moteurs IA, réseaux sociaux. Configuration en 5 jours ouvrés.",
  },
  {
    num: "02",
    title: "Analyze",
    desc: "HarchIQ analyse chaque mention : sentiment, catégorie de risque, entités citées, journaliste, média. Score de réputation calculé en continu sur 5 piliers.",
  },
  {
    num: "03",
    title: "Alert",
    desc: "Alertes WhatsApp temps réel sur pic de sentiment négatif. Brief exécutif hebdo. Rapport PDF mensuel board-ready. Vous êtes prévenu avant tout le monde.",
  },
  {
    num: "04",
    title: "Act",
    desc: "Décidez avec la vision complète. Pilotez votre communication, mesurez l'impact, anticipez les crises. Votre board dispose de KPI consolidés.",
  },
];

const CASES = [
  {
    sector: "Banque",
    title: "Anticipation d'une crise de confiance",
    desc: "Une banque marocaine identifie une dérive de sentiment sur les réseaux 6 jours avant qu'elle n'atteigne la presse nationale. Plan de comms déclenché, crise évitée.",
    metric: "−72 %",
    metricLabel: "amplitude de la crise vs prévision initiale",
  },
  {
    sector: "Télécom",
    title: "Visibilité IA sur un lancement 5G",
    desc: "Un opérateur suit pendant 3 mois ce que ChatGPT, Perplexity et Gemini répondent à la question « Quelle est la meilleure offre 5G au Maroc ? ». Ajustement SEO IA en continu.",
    metric: "+34 pts",
    metricLabel: "de mentions positives dans les réponses IA",
  },
  {
    sector: "Distribution",
    title: "Suivi d'un risque de boycott",
    desc: "Une enseigne détecte la formation d'un hashtag de boycott 3 semaines avant son pic. Engagement d'influenceurs, refonte du discours. Boycott absorbé sans impact commercial.",
    metric: "J+21",
    metricLabel: "d'anticipation détectée",
  },
];

const COMPARISON_VS_PR = [
  { feature: "Sources surveillées", harch: "20+ marocaines + 9 IA", pr: "5–10 manuelles" },
  { feature: "Latence d'alerte", harch: "< 15 minutes", pr: "24–72 heures" },
  { feature: "Analyse de sentiment", harch: "Automatisée par entité", pr: "Manuelle, subjective" },
  { feature: "Veille IA (ChatGPT, Perplexity…)", harch: "9 moteurs", pr: "Non couverte" },
  { feature: "Score consolidé", harch: "5 piliers, continu", pr: "Ad hoc, ponctuel" },
  { feature: "Rapport board-ready", harch: "Mensuel automatique", pr: "Sur demande, facturé" },
  { feature: "Traçabilité source", harch: "SHA-256 horodatée", pr: "Capture écran" },
  { feature: "Coût mensuel", harch: "Sur devis, fixe", pr: "Quotidienne × jours" },
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

export default function SolutionsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <AtelierNav />

      <main style={{ flex: 1 }}>
        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section style={{ ...sectionStyle, paddingTop: "96px", paddingBottom: "48px", textAlign: "center" }}>
          <div style={eyebrowStyle}>Solutions · Harch Atelier</div>
          <h1
            style={{
              fontSize: "clamp(36px, 5.5vw, 56px)",
              fontWeight: 700,
              color: C.text,
              fontFamily: C.fontSans,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "20px",
              maxWidth: "840px",
              margin: "0 auto 20px",
            }}
          >
            Quatre problèmes. Une plateforme.
          </h1>
          <p
            style={{
              ...bodyStyle,
              fontSize: "19px",
              maxWidth: "720px",
              margin: "0 auto 32px",
            }}
          >
            La réputation n'est plus une préoccupation de RP. C'est un actif
            stratégique. Voici comment nous la surveillons, l'analyons et la
            rendons actionnable.
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

        {/* ─── CAPABILITIES ──────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={{ marginBottom: "48px" }}>
            <div style={eyebrowStyle}>Cinq capacités</div>
            <h2 style={headingStyle}>Une seule plateforme, cinq usages</h2>
            <p style={{ ...bodyStyle, maxWidth: "640px" }}>
              Chaque capacité se configure indépendamment. Vous activez ce dont
              vous avez besoin, sans payer pour le reste.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "20px",
            }}
          >
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                style={{
                  padding: "28px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
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
                    fontSize: "28px",
                    marginBottom: "14px",
                    lineHeight: 1,
                  }}
                  aria-hidden
                >
                  {cap.icon}
                </div>
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: C.fontSans,
                    marginBottom: "10px",
                  }}
                >
                  {cap.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: C.textBody,
                    fontFamily: C.fontSans,
                    lineHeight: 1.6,
                    marginBottom: "16px",
                  }}
                >
                  {cap.desc}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {cap.points.map((p) => (
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
        </section>

        {/* ─── PROBLEMS MATRIX ───────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ marginBottom: "40px" }}>
              <div style={eyebrowStyle}>Quatre problèmes</div>
              <h2 style={headingStyle}>Avant / Après Harch</h2>
              <p style={{ ...bodyStyle, maxWidth: "640px" }}>
                Quatre situations que nous voyons chaque semaine. Et la façon
                dont nous les résolvons.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: "20px",
              }}
            >
              {PROBLEMS.map((p) => (
                <div
                  key={p.problem}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: C.fontSans,
                      marginBottom: "16px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.problem}
                  </h3>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: C.dangerBg,
                      border: `1px solid ${C.border}`,
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontFamily: C.fontMono,
                        color: C.danger,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      Avant
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: C.textBody,
                        fontFamily: C.fontSans,
                        lineHeight: 1.5,
                      }}
                    >
                      {p.before}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: C.successBg,
                      border: `1px solid ${C.border}`,
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontFamily: C.fontMono,
                        color: C.success,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      Avec Harch
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: C.text,
                        fontFamily: C.fontSans,
                        lineHeight: 1.5,
                      }}
                    >
                      {p.after}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {p.features.map((f) => (
                      <div
                        key={f}
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          fontSize: "12px",
                          fontFamily: C.fontSans,
                          color: C.textBody,
                        }}
                      >
                        <span
                          style={{
                            color: C.cta,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ──────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ ...eyebrowStyle, marginBottom: "12px" }}>Comment ça marche</div>
            <h2 style={headingStyle}>Connect → Analyze → Alert → Act</h2>
            <p
              style={{
                ...bodyStyle,
                maxWidth: "640px",
                margin: "0 auto",
              }}
            >
              Quatre étapes, du paramétrage à la décision.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "20px",
              position: "relative",
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.num}
                style={{
                  padding: "28px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  borderTop: `3px solid ${C.accent}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: C.accent,
                    fontFamily: C.fontMono,
                    letterSpacing: "-0.02em",
                    marginBottom: "12px",
                    lineHeight: 1,
                  }}
                >
                  {s.num}
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
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: C.textBody,
                    fontFamily: C.fontSans,
                    lineHeight: 1.55,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CASE STUDIES ──────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ marginBottom: "40px" }}>
              <div style={eyebrowStyle}>Cas d'usage</div>
              <h2 style={headingStyle}>Trois situations réelles (anonymisées)</h2>
              <p style={{ ...bodyStyle, maxWidth: "640px" }}>
                Les noms et secteurs exacts sont masqués. Les mécanismes et les
                résultats sont réels.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "20px",
              }}
            >
              {CASES.map((c) => (
                <div
                  key={c.title}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      background: C.bgSubtle,
                      border: `1px solid ${C.border}`,
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontFamily: C.fontMono,
                      color: C.accent,
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: "16px",
                      alignSelf: "flex-start",
                    }}
                  >
                    {c.sector}
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: C.fontSans,
                      marginBottom: "10px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.6,
                      marginBottom: "20px",
                    }}
                  >
                    {c.desc}
                  </p>
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "16px",
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: C.cta,
                        fontFamily: C.fontSans,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                        marginBottom: "6px",
                      }}
                    >
                      {c.metric}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: C.textMuted,
                        fontFamily: C.fontSans,
                        lineHeight: 1.4,
                      }}
                    >
                      {c.metricLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── VS TRADITIONAL PR ─────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={{ marginBottom: "32px" }}>
            <div style={eyebrowStyle}>Harch vs RP traditionnel</div>
            <h2 style={headingStyle}>Pourquoi changer maintenant</h2>
            <p style={{ ...bodyStyle, maxWidth: "640px" }}>
              Le RP traditionnel reste nécessaire. Mais il ne suffit plus face
              à un paysage médiatique continu, multicanal et IA-médié.
            </p>
          </div>
          <div
            style={{
              overflowX: "auto",
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: C.fontSans,
                minWidth: "560px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: C.bgSubtle,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px",
                      fontSize: "12px",
                      fontFamily: C.fontMono,
                      color: C.textMuted,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Critère
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: C.cta,
                      fontFamily: C.fontSans,
                    }}
                  >
                    Harch Atelier
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: C.textMuted,
                      fontFamily: C.fontSans,
                    }}
                  >
                    RP traditionnel
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_VS_PR.map((row) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: C.text,
                        fontFamily: C.fontSans,
                        fontWeight: 500,
                      }}
                    >
                      {row.feature}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: C.text,
                        fontFamily: C.fontSans,
                        background: "rgba(16,185,129,0.04)",
                        fontWeight: 600,
                      }}
                    >
                      {row.harch}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: C.textMuted,
                        fontFamily: C.fontSans,
                      }}
                    >
                      {row.pr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              Identifiez vos quatre problèmes.
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: C.textOnDarkBody,
                fontFamily: C.fontSans,
                maxWidth: "520px",
                margin: "0 auto 28px",
                lineHeight: 1.6,
              }}
            >
              30 minutes de démo pour cartographier votre exposition et prioriser
              les actions.
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
