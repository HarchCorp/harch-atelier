"use client";

import React from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — PRODUCTS HUB PAGE
//  « Choisissez votre plan. »
//  4 plans · Tous « Sur devis » · Sidebar CTA Harch 100 + Contact
// ═══════════════════════════════════════════════════════════════════════

interface Plan {
  name: string;
  tagline: string;
  highlighted?: boolean;
  bestFor: string;
  capabilities: string[];
  keyFeatures: string[];
  href: string;
}

const PLANS: Plan[] = [
  {
    name: "Essentiel",
    tagline: "Pour l'entreprise qui démarre sa veille réputationnelle.",
    bestFor: "PME, directions comms d'une personne, premiers indicateurs.",
    capabilities: [
      "5 entités surveillées",
      "20+ sources marocaines",
      "Analyse de sentiment hebdomadaire",
      "Dashboard en lecture",
      "1 utilisateur",
    ],
    keyFeatures: [
      "Rapport PDF mensuel",
      "Score de réputation (5 piliers)",
      "Alertes email (seuil critique)",
      "Historique 90 jours",
    ],
    href: "/atelier/audit",
  },
  {
    name: "Pro",
    tagline: "Pour la direction comms qui doit anticiper.",
    highlighted: true,
    bestFor: "ETI, directions comms de 2 à 5 personnes, suivi concurrentiel.",
    capabilities: [
      "25 entités surveillées",
      "20+ sources + réseaux sociaux",
      "Analyse de sentiment en continu",
      "Dashboard complet + comparateurs",
      "5 utilisateurs",
      "Veille IA (4 moteurs)",
    ],
    keyFeatures: [
      "Alertes WhatsApp temps réel",
      "Rapport PDF mensuel + brief exécutif hebdo",
      "Suivi concurrentiel (3 concurrents)",
      "Historique 12 mois",
      "API lecture (1 000 appels/mois)",
    ],
    href: "/atelier/audit",
  },
  {
    name: "Grandes Entreprises",
    tagline: "Pour le groupe qui industrialise l'intelligence réputationnelle.",
    bestFor: "Groups cotés, directions risques, conformité, boards.",
    capabilities: [
      "Entités illimitées",
      "20+ sources + 8 moteurs IA",
      "Analyse multilingue (FR, AR, EN)",
      "Dashboards personnalisés + SSO",
      "Utilisateurs illimités",
      "Veille IA (9 moteurs)",
    ],
    keyFeatures: [
      "Alertes WhatsApp + SMS + Teams",
      "Rapports board-ready + sur-mesure",
      "Module conformité CNDP + Loi 09-08",
      "Historique illimité",
      "API complète (100k appels/mois)",
      "SLA 99,9 % + onboarding dédié",
    ],
    href: "/atelier/audit",
  },
  {
    name: "Agences",
    tagline: "Pour l'agence qui multi-clients et white-label.",
    bestFor: "Agences RP, cabinets de conseil, intégrateurs.",
    capabilities: [
      "Multi-comptes clients",
      "Sources + veille IA complète",
      "Tableaux de bord white-label",
      "Gestion des droits par client",
      "Utilisateurs illimités",
    ],
    keyFeatures: [
      "Rapports brandés aux couleurs du client",
      "Facturation par compte",
      "API complète + webhooks",
      "Historique illimité",
      "Support dédié + formation équipe",
    ],
    href: "/atelier/audit",
  },
];

const SIDEBAR_CTA = [
  {
    icon: "🏆",
    title: "Le Harch 100",
    desc: "Le classement de réputation des 100 plus grandes entreprises marocaines — mis à jour mensuellement.",
    href: "/atelier/harch-100",
    cta: "Voir le classement",
  },
  {
    icon: "💬",
    title: "Besoin d'aide ?",
    desc: "Un expert vous rappelle sous 24h pour vous orienter vers le plan adapté à votre périmètre.",
    href: "/atelier/audit",
    cta: "Parler à un expert",
  },
  {
    icon: "📐",
    title: "Comparer en détail",
    desc: "Matrice complète 24 critères × 4 plans pour décider à tête reposée.",
    href: "/atelier/pricing",
    cta: "Voir la matrice",
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

export default function ProductHubPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <AtelierNav />

      <main style={{ flex: 1 }}>
        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section style={{ ...sectionStyle, paddingTop: "96px", paddingBottom: "48px", textAlign: "center" }}>
          <div style={eyebrowStyle}>Produits · Harch Atelier</div>
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
            Choisissez votre plan.
          </h1>
          <p
            style={{
              ...bodyStyle,
              fontSize: "19px",
              maxWidth: "720px",
              margin: "0 auto 24px",
            }}
          >
            Quatre offres pour quatre profils. Tous les prix sont sur devis —
            chaque périmètre est différent.
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
              padding: "10px 20px",
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
              borderRadius: "999px",
              fontSize: "12px",
              fontFamily: C.fontMono,
              color: C.textBody,
              letterSpacing: "0.04em",
            }}
          >
            <span>20+ sources</span>
            <span style={{ color: C.borderStrong }}>·</span>
            <span>9 moteurs IA</span>
            <span style={{ color: C.borderStrong }}>·</span>
            <span>CNDP · Loi 09-08</span>
            <span style={{ color: C.borderStrong }}>·</span>
            <span>SHA-256</span>
          </div>
        </section>

        {/* ─── MAIN GRID: PLANS + SIDEBAR ────────────────────────── */}
        <section style={{ ...sectionStyle, paddingTop: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 320px",
              gap: "32px",
              alignItems: "start",
            }}
            className="harch-products-grid"
          >
            {/* PLANS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                gap: "20px",
              }}
            >
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    padding: "28px",
                    background: plan.highlighted ? C.bgDarkest : C.bg,
                    border: plan.highlighted
                      ? `1px solid ${C.bgDarkest}`
                      : `1px solid ${C.border}`,
                    borderRadius: "14px",
                    color: plan.highlighted ? C.textOnDark : C.text,
                    boxShadow: plan.highlighted ? C.shadowMd : "none",
                  }}
                >
                  {plan.highlighted && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "4px 14px",
                        background: C.cta,
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontFamily: C.fontMono,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        borderRadius: "999px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Le plus demandé
                    </div>
                  )}
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      fontFamily: C.fontSans,
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                      color: plan.highlighted ? C.textOnDark : C.text,
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: plan.highlighted ? C.textOnDarkBody : C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.5,
                      marginBottom: "20px",
                      minHeight: "56px",
                    }}
                  >
                    {plan.tagline}
                  </p>
                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        color: plan.highlighted ? C.textOnDark : C.text,
                        fontFamily: C.fontSans,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                      }}
                    >
                      Sur devis
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: plan.highlighted ? C.textOnDarkBody : C.textMuted,
                        fontFamily: C.fontMono,
                        letterSpacing: "0.04em",
                        marginTop: "6px",
                      }}
                    >
                      Engagement annuel · paiement mensuel
                    </div>
                  </div>
                  <a
                    href={plan.href}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "12px 20px",
                      background: plan.highlighted ? C.cta : "transparent",
                      color: plan.highlighted ? "#FFFFFF" : C.text,
                      border: plan.highlighted ? "none" : `1px solid ${C.borderStrong}`,
                      fontFamily: C.fontSans,
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: "none",
                      borderRadius: "8px",
                      marginBottom: "24px",
                      transition: "background 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (plan.highlighted) {
                        e.currentTarget.style.background = C.ctaHover;
                      } else {
                        e.currentTarget.style.background = C.bgHover;
                        e.currentTarget.style.borderColor = C.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.highlighted) {
                        e.currentTarget.style.background = C.cta;
                      } else {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = C.borderStrong;
                      }
                    }}
                  >
                    Demander une démo →
                  </a>

                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: C.fontMono,
                        color: plan.highlighted ? C.textOnDarkBody : C.textMuted,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                        fontWeight: 700,
                      }}
                    >
                      Idéal pour
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: plan.highlighted ? C.textOnDarkBody : C.textBody,
                        fontFamily: C.fontSans,
                        lineHeight: 1.5,
                      }}
                    >
                      {plan.bestFor}
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: C.fontMono,
                        color: plan.highlighted ? C.textOnDarkBody : C.textMuted,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                        fontWeight: 700,
                      }}
                    >
                      Capacités
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
                      {plan.capabilities.map((cap) => (
                        <li
                          key={cap}
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-start",
                            fontSize: "13px",
                            fontFamily: C.fontSans,
                            lineHeight: 1.5,
                            color: plan.highlighted ? C.textOnDarkBody : C.textBody,
                          }}
                        >
                          <span
                            style={{
                              color: C.cta,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: C.fontMono,
                        color: plan.highlighted ? C.textOnDarkBody : C.textMuted,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                        fontWeight: 700,
                      }}
                    >
                      Fonctions clés
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
                      {plan.keyFeatures.map((kf) => (
                        <li
                          key={kf}
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-start",
                            fontSize: "13px",
                            fontFamily: C.fontSans,
                            lineHeight: 1.5,
                            color: plan.highlighted ? C.textOnDark : C.text,
                          }}
                        >
                          <span
                            style={{
                              color: plan.highlighted ? C.ctaHover : C.accent,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            →
                          </span>
                          <span>{kf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* SIDEBAR */}
            <aside
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                position: "sticky",
                top: "84px",
              }}
              className="harch-products-sidebar"
            >
              {SIDEBAR_CTA.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  style={{
                    display: "block",
                    padding: "24px",
                    background: C.bgSubtle,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    textDecoration: "none",
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
                      fontSize: "24px",
                      marginBottom: "12px",
                      lineHeight: 1,
                    }}
                    aria-hidden
                  >
                    {c.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: C.fontSans,
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.55,
                      marginBottom: "14px",
                    }}
                  >
                    {c.desc}
                  </p>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: C.accent,
                      fontFamily: C.fontSans,
                    }}
                  >
                    {c.cta}
                    <span aria-hidden>→</span>
                  </div>
                </a>
              ))}
            </aside>
          </div>

          <style>{`
            @media (max-width: 900px) {
              .harch-products-grid {
                grid-template-columns: 1fr !important;
              }
              .harch-products-sidebar {
                position: static !important;
                grid-template-columns: 1fr 1fr !important;
                display: grid !important;
              }
            }
            @media (max-width: 560px) {
              .harch-products-sidebar {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </section>

        {/* ─── CTA STRIP ─────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div
            style={{
              background: C.bgDarkest,
              borderRadius: "16px",
              padding: "48px 32px",
              textAlign: "center",
              color: C.textOnDark,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 32px)",
                fontWeight: 700,
                fontFamily: C.fontSans,
                letterSpacing: "-0.02em",
                marginBottom: "12px",
                color: C.textOnDark,
              }}
            >
              30 minutes pour décider.
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: C.textOnDarkBody,
                fontFamily: C.fontSans,
                maxWidth: "520px",
                margin: "0 auto 24px",
                lineHeight: 1.6,
              }}
            >
              Démo personnalisée, devis précis sous 48 heures. Sans carte
              bancaire, sans engagement.
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
