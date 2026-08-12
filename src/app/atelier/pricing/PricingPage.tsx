"use client";

import React, { useState } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — PRICING PAGE
//  4 plans · Structure Meltwater · Tous « Sur devis »
//  Capacités + Idéal pour + Fonctions clés · Matrice comparative · 5 solutions
// ═══════════════════════════════════════════════════════════════════════

interface Plan {
  name: string;
  tagline: string;
  highlighted?: boolean;
  capabilities: string[];
  bestFor: string[];
  keyFeatures: string[];
  note?: string;
}

// ─── 4 PLANS — STRUCTURE MELTWATER EXACTE ─────────────────────────────
const PLANS: Plan[] = [
  {
    name: "Essentiel",
    tagline:
      "Pour les petites équipes de communication et marketing qui démarrent leur veille réputationnelle et leur suivi de la visibilité IA.",
    capabilities: [
      "Veille médiatique",
      "Social listening",
      "Suivi de la visibilité IA (GenAI Lens)",
      "Relations médias",
    ],
    bestFor: [
      "Les petites équipes de communication/marketing",
      "Les start-ups et les entreprises en pleine croissance",
      "Capacités d'analyse internes limitées",
    ],
    keyFeatures: [
      "HarchIQ AI (50 questions/jour)",
      "Alertes et rapports",
      "Tableaux de bord prédéfinis",
    ],
  },
  {
    name: "Pro",
    tagline:
      "Pour les équipes régionales et les organisations de marketing multicanal qui doivent anticiper avec une analyse avancée.",
    highlighted: true,
    capabilities: [
      "Veille médiatique",
      "Social listening",
      "Suivi de la visibilité IA (GenAI Lens)",
      "Relations médias",
    ],
    bestFor: [
      "Les équipes régionales",
      "Les organisations de marketing multicanal",
      "Équipes de communication axées sur les données",
    ],
    keyFeatures: [
      "HarchIQ AI — Avancé (200 questions/jour)",
      "Benchmarking concurrentiel",
      "Tableaux de bord et rapports personnalisés",
    ],
  },
  {
    name: "Grandes Entreprises",
    tagline:
      "Pour les marques leaders et internationales qui industrialisent l'intelligence réputationnelle avec gouvernance et conformité.",
    capabilities: [
      "Veille médiatique",
      "Social listening",
      "Suivi de la visibilité IA (GenAI Lens)",
      "Marketing d'influence",
      "Relations médias",
    ],
    bestFor: [
      "Les marques leaders et internationales",
      "Marchés et parties prenantes multiples",
      "Besoins analytiques avancés",
    ],
    keyFeatures: [
      "HarchIQ AI — Version entreprise (illimité)",
      "Intégrations API et MCP",
      "Gouvernance, workflows et autorisations",
    ],
  },
  {
    name: "Agences",
    tagline:
      "Pour les agences RP et cabinets de conseil qui gèrent plusieurs clients en portefeuille avec white-label et gouvernance multi-comptes.",
    capabilities: [
      "Veille médiatique",
      "Social listening",
      "Suivi de la visibilité IA (GenAI Lens)",
      "Marketing d'influence",
      "Relations médias",
    ],
    bestFor: [
      "Débutants (petites agences / peu de clients)",
      "Croissance (équipes gérant plusieurs clients)",
      "Entreprise Agence (portfolios importants, envergure internationale)",
    ],
    keyFeatures: [
      "HarchIQ AI — Avancé",
      "Intégrations API et MCP",
      "Gouvernance, workflows et autorisations",
      "Multi-clients + White-label",
    ],
    note: "3 niveaux disponibles selon la taille de l'agence",
  },
];

// ─── 5 DOMAINES DE SOLUTION — MELTWATER EXACT ─────────────────────────
const SOLUTIONS = [
  {
    title: "Veille médiatique",
    desc: "Surveillez en temps réel les articles de presse, blogs, et médias marocains et internationaux qui mentionnent vos entités.",
    icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  },
  {
    title: "Social listening",
    desc: "Capturez les conversations sur X, LinkedIn, Facebook, Instagram et identifiez les tendances narratives émergentes.",
    icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  },
  {
    title: "Suivi de la visibilité IA (GenAI Lens)",
    desc: "Mesurez ce que ChatGPT, Perplexity, Gemini, Claude et Copilot disent de votre marque — l'avenir de la réputation.",
    icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 1 1-8 8 8 8 0 0 1 8-8zm-1 13v-2h2v2zm.4-4h1.2l.4-1.5a2 2 0 1 0-2 0z",
  },
  {
    title: "Marketing d'influence",
    desc: "Identifiez, évaluez et mesurez l'impact des influenceurs pertinents pour votre marque et vos campagnes.",
    icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 7.5a4 4 0 1 1 5 5l-1 1-1.5-1.5 1-1z",
  },
  {
    title: "Relations médias",
    desc: "Identifiez les journalistes pertinents, mesurez le share of voice et optimisez vos campagnes RP et l'impact médiatique.",
    icon: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8V6z",
  },
];

// ─── MATRICE COMPARATIVE — STRUCTURE MELTWATER ───────────────────────
interface Row {
  category: string;
  label: string;
  values: [string, string, string, string]; // Essentiel, Pro, Grandes Entreprises, Agences
}

const COMPARISON: Row[] = [
  // ─── Capacités incluses ───────────────────────────────────────
  { category: "Capacités incluses", label: "Veille médiatique", values: ["✓", "✓", "✓", "✓"] },
  { category: "Capacités incluses", label: "Social listening", values: ["✓", "✓", "✓", "✓"] },
  { category: "Capacités incluses", label: "Suivi de la visibilité IA (GenAI Lens)", values: ["✓", "✓", "✓", "✓"] },
  { category: "Capacités incluses", label: "Relations médias", values: ["✓", "✓", "✓", "✓"] },
  { category: "Capacités incluses", label: "Marketing d'influence", values: ["—", "—", "✓", "✓"] },
  // ─── HarchIQ AI ───────────────────────────────────────────────
  { category: "HarchIQ AI", label: "Niveau HarchIQ AI", values: ["Standard", "Avancé", "Entreprise", "Avancé"] },
  { category: "HarchIQ AI", label: "Questions par jour", values: ["50", "200", "Illimité", "200"] },
  // ─── Analyse & rapports ──────────────────────────────────────
  { category: "Analyse & rapports", label: "Alertes et rapports", values: ["✓", "✓", "✓", "✓"] },
  { category: "Analyse & rapports", label: "Tableaux de bord prédéfinis", values: ["✓", "✓", "✓", "✓"] },
  { category: "Analyse & rapports", label: "Benchmarking concurrentiel", values: ["—", "✓", "✓", "✓"] },
  { category: "Analyse & rapports", label: "Tableaux de bord et rapports personnalisés", values: ["—", "✓", "✓", "✓"] },
  { category: "Analyse & rapports", label: "Rapports board-ready", values: ["—", "—", "✓", "✓"] },
  // ─── Intégrations & gouvernance ──────────────────────────────
  { category: "Intégrations & gouvernance", label: "Intégrations API et MCP", values: ["—", "—", "✓", "✓"] },
  { category: "Intégrations & gouvernance", label: "Gouvernance, workflows et autorisations", values: ["—", "—", "✓", "✓"] },
  { category: "Intégrations & gouvernance", label: "SSO / SAML", values: ["—", "—", "✓", "✓"] },
  // ─── Multi-clients ───────────────────────────────────────────
  { category: "Multi-clients", label: "Multi-clients", values: ["—", "—", "—", "✓"] },
  { category: "Multi-clients", label: "White-label", values: ["—", "—", "—", "✓"] },
  { category: "Multi-clients", label: "Facturation par compte", values: ["—", "—", "—", "✓"] },
];

const FAQ = [
  {
    q: "Pourquoi tous les prix sont-ils « Sur devis » ?",
    a: "Chaque entreprise a un périmètre de surveillance différent (nombre d'entités, langues, concurrents, intégrations). Une démo de 30 minutes suffit pour établir un devis précis — sans engagement et sans carte bancaire.",
  },
  {
    q: "Combien de temps prend la mise en place ?",
    a: "Pour le plan Essentiel : 48 heures après signature. Pour les plans Pro et Grandes Entreprises : 5 à 10 jours ouvrés (incluant l'onboarding, le paramétrage des sources et la formation de l'équipe).",
  },
  {
    q: "Mes données sont-elles hébergées au Maroc ?",
    a: "L'architecture est conforme à la Loi 09-08 et aux recommandations CNDP. Les données personnelles identifiées sont minimisées, les sources sont horodatées et empreinte SHA-256. Le détail d'hébergement est communiqué lors de la démo et formalisé dans le DPA.",
  },
  {
    q: "Puis-je changer de plan en cours d'année ?",
    a: "Oui. Le passage à un plan supérieur se fait au prorata. Le passage à un plan inférieur s'applique à la date anniversaire du contrat. Aucune pénalité dans les deux cas.",
  },
  {
    q: "Quelle est la durée d'engagement ?",
    a: "Plans Essentiel et Pro : engagement annuel avec paiement mensuel. Grandes Entreprises et Agences : contrat-cadre 12 ou 24 mois avec clauses de révision trimestrielle. Un essai pilote de 30 jours est possible pour les plans Pro et supérieurs.",
  },
];

const TRUST = [
  { label: "CNDP", desc: "Conformité aux recommandations de la Commission Nationale de contrôle de la protection des Données à caractère Personnel." },
  { label: "Loi 09-08", desc: "Application de la loi marocaine sur la protection des personnes physiques à l'égard du traitement des données à caractère personnel." },
  { label: "SHA-256", desc: "Empreinte cryptographique de chaque source collectée — traçabilité et intégrité vérifiables." },
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

// ─── Section header inside a plan card ────────────────────────────────
function SectionLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontFamily: C.fontMono,
        color: dark ? C.textOnDarkBody : C.textMuted,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: "12px",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <AtelierNav />

      <main style={{ flex: 1 }}>
        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section style={{ ...sectionStyle, paddingTop: "96px", paddingBottom: "48px", textAlign: "center" }}>
          <div style={eyebrowStyle}>Tarifs · Harch Atelier</div>
          <h1
            style={{
              fontSize: "clamp(36px, 5.5vw, 56px)",
              fontWeight: 700,
              color: C.text,
              fontFamily: C.fontSans,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "20px",
              maxWidth: "880px",
              margin: "0 auto 20px",
            }}
          >
            Choisissez la plateforme qui correspond à votre maturité.
          </h1>
          <p
            style={{
              ...bodyStyle,
              fontSize: "19px",
              maxWidth: "700px",
              margin: "0 auto 32px",
            }}
          >
            Quatre formules, du premier réflexe de veille à l'industrialisation
            de l'intelligence réputationnelle. Toutes les capacités, toutes les
            intégrations, un seul devis — sans engagement, sans carte bancaire.
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              padding: "10px 18px",
              background: C.bgSubtle,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: "999px",
            }}
          >
            {TRUST.map((t) => (
              <span
                key={t.label}
                style={{
                  fontSize: "12px",
                  fontFamily: C.fontMono,
                  color: C.text,
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  background: "#ffffff",
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </section>

        {/* ─── PLANS GRID (4 CARDS — MELTWATER STRUCTURE) ───────── */}
        <section style={{ ...sectionStyle, paddingTop: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
              alignItems: "stretch",
            }}
          >
            {PLANS.map((plan) => {
              const dark = false; // white cards on white bg, like Meltwater — Pro gets green border
              return (
                <div
                  key={plan.name}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    padding: "28px",
                    background: C.bg,
                    border: plan.highlighted
                      ? `2px solid ${C.cta}`
                      : `1px solid ${C.border}`,
                    borderRadius: "12px",
                    color: C.text,
                    boxShadow: plan.highlighted ? C.shadowMd : C.shadowSm,
                  }}
                >
                  {plan.highlighted && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "5px 14px",
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
                      Le plus populaire
                    </div>
                  )}

                  {/* ─── Plan name + tagline ──────────────────────────── */}
                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      fontFamily: C.fontSans,
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                      color: C.text,
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.5,
                      marginBottom: "20px",
                      minHeight: "60px",
                    }}
                  >
                    {plan.tagline}
                  </p>

                  {/* ─── Price ───────────────────────────────────────── */}
                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: C.text,
                        fontFamily: C.fontSans,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                      }}
                    >
                      Sur devis
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: C.textMuted,
                        fontFamily: C.fontMono,
                        letterSpacing: "0.04em",
                        marginTop: "6px",
                      }}
                    >
                      Engagement annuel · paiement mensuel
                    </div>
                  </div>

                  {/* ─── CTA ─────────────────────────────────────────── */}
                  <a
                    href="/atelier/audit"
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
                    Contacter le service commercial →
                  </a>

                  {/* ─── CHOISISSEZ VOS CAPACITÉS ───────────────────── */}
                  <div style={{ marginBottom: "20px" }}>
                    <SectionLabel dark={dark}>Choisissez vos capacités</SectionLabel>
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
                            color: C.textBody,
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

                  {/* ─── IDÉAL POUR (Best For — 3 bullets) ──────────── */}
                  <div style={{ marginBottom: "20px" }}>
                    <SectionLabel dark={dark}>Idéal pour</SectionLabel>
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
                      {plan.bestFor.map((bf) => (
                        <li
                          key={bf}
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-start",
                            fontSize: "13px",
                            fontFamily: C.fontSans,
                            lineHeight: 1.5,
                            color: C.textBody,
                          }}
                        >
                          <span
                            style={{
                              color: C.accent,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            •
                          </span>
                          <span>{bf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ─── FONCTIONS CLÉS (Key Features) ──────────────── */}
                  <div style={{ marginTop: "auto" }}>
                    <SectionLabel dark={dark}>Fonctions clés</SectionLabel>
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
                            color: C.text,
                            fontWeight: 500,
                          }}
                        >
                          <span
                            style={{
                              color: C.accent,
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

                  {/* ─── Optional note (Agences 3 sub-levels) ───────── */}
                  {plan.note && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "10px 12px",
                        background: C.bgSubtle,
                        border: `1px solid ${C.border}`,
                        borderRadius: "6px",
                        fontSize: "11px",
                        color: C.textMuted,
                        fontFamily: C.fontMono,
                        letterSpacing: "0.04em",
                        textAlign: "center",
                      }}
                    >
                      {plan.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 5 SOLUTION AREAS ──────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ marginBottom: "40px", textAlign: "center" }}>
              <div style={{ ...eyebrowStyle, marginBottom: "12px" }}>Domaines de solution</div>
              <h2 style={{ ...headingStyle, marginBottom: "12px" }}>
                5 domaines. Une seule plateforme.
              </h2>
              <p style={{ ...bodyStyle, maxWidth: "640px", margin: "0 auto" }}>
                Composez votre périmètre en fonction de votre maturité — du premier
                réflexe de veille à l'industrialisation de l'intelligence
                réputationnelle.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: "20px",
              }}
            >
              {SOLUTIONS.map((s) => (
                <div
                  key={s.title}
                  style={{
                    padding: "24px",
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.cta;
                    e.currentTarget.style.boxShadow = C.shadowSm;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: C.bgSubtle,
                      border: `1px solid ${C.border}`,
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={C.cta}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d={s.icon} />
                    </svg>
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      fontFamily: C.fontSans,
                      color: C.text,
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
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
          </div>
        </section>

        {/* ─── COMPARISON MATRIX ─────────────────────────────────── */}
        <section>
          <div style={sectionStyle}>
            <div style={{ marginBottom: "32px" }}>
              <div style={eyebrowStyle}>Comparatif détaillé</div>
              <h2 style={{ ...headingStyle, marginBottom: "12px" }}>
                18 critères. 4 formules.
              </h2>
              <p style={{ ...bodyStyle, maxWidth: "640px" }}>
                Faites défiler horizontalement sur mobile pour comparer.
                Le plan Pro est mis en avant pour les équipes régionales.
              </p>
            </div>
            <div
              style={{
                overflowX: "auto",
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                background: C.bg,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: C.fontSans,
                  minWidth: "760px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      background: C.bgSubtle,
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
                        width: "44%",
                      }}
                    >
                      Critère
                    </th>
                    {PLANS.map((p) => (
                      <th
                        key={p.name}
                        style={{
                          textAlign: "center",
                          padding: "16px 12px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: p.highlighted ? C.cta : C.text,
                          fontFamily: C.fontSans,
                          letterSpacing: "-0.01em",
                          background: p.highlighted ? "rgba(16,185,129,0.06)" : "transparent",
                          borderBottom: p.highlighted ? `2px solid ${C.cta}` : "none",
                        }}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => {
                    const showCategory =
                      i === 0 || COMPARISON[i - 1].category !== row.category;
                    return (
                      <React.Fragment key={row.label}>
                        {showCategory && (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                padding: "16px 16px 6px",
                                background: C.bgSubtle,
                                borderBottom: `1px solid ${C.border}`,
                                fontSize: "11px",
                                fontFamily: C.fontMono,
                                color: C.accent,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                fontWeight: 700,
                              }}
                            >
                              {row.category}
                            </td>
                          </tr>
                        )}
                        <tr
                          style={{
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: "13px",
                              color: C.text,
                              fontFamily: C.fontSans,
                            }}
                          >
                            {row.label}
                          </td>
                          {row.values.map((v, vi) => (
                            <td
                              key={vi}
                              style={{
                                padding: "12px",
                                textAlign: "center",
                                fontSize: "13px",
                                color:
                                  v === "—"
                                    ? C.textMuted
                                    : v === "✓"
                                    ? C.cta
                                    : C.text,
                                fontFamily: C.fontSans,
                                fontWeight: v === "✓" ? 700 : 500,
                                background:
                                  PLANS[vi].highlighted && v !== "—"
                                    ? "rgba(16,185,129,0.04)"
                                    : "transparent",
                              }}
                            >
                              {v}
                            </td>
                          ))}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── TRUST ─────────────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ ...eyebrowStyle, marginBottom: "12px" }}>Conformité</div>
              <h2 style={{ ...headingStyle, marginBottom: "12px" }}>
                Vos données, encadrées par le droit marocain
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: "20px",
              }}
            >
              {TRUST.map((t) => (
                <div
                  key={t.label}
                  style={{
                    padding: "28px",
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      background: "#ffffff",
                      border: `1px solid ${C.borderStrong}`,
                      color: C.text,
                      fontSize: "12px",
                      fontFamily: C.fontMono,
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      borderRadius: "4px",
                      marginBottom: "16px",
                    }}
                  >
                    {t.label}
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: C.textBody,
                      fontFamily: C.fontSans,
                      lineHeight: 1.6,
                    }}
                  >
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────────────── */}
        <section>
          <div style={{ ...sectionStyle, maxWidth: "840px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ ...eyebrowStyle, marginBottom: "12px" }}>FAQ</div>
              <h2 style={headingStyle}>Questions fréquentes</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={i}
                    style={{
                      background: C.bgSubtle,
                      border: `1px solid ${C.border}`,
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "20px 24px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        fontFamily: C.fontSans,
                        fontSize: "15px",
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      <span>{item.q}</span>
                      <span
                        style={{
                          fontSize: "18px",
                          color: C.accent,
                          flexShrink: 0,
                          transition: "transform 0.2s",
                          transform: open ? "rotate(45deg)" : "none",
                        }}
                        aria-hidden
                      >
                        +
                      </span>
                    </button>
                    {open && (
                      <div
                        style={{
                          padding: "0 24px 20px",
                          fontSize: "14px",
                          color: C.textBody,
                          fontFamily: C.fontSans,
                          lineHeight: 1.6,
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
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
              Toujours indécis ?
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
              30 minutes de démo suffisent pour vous orienter vers le bon plan
              et établir un devis précis.
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
              Contacter le service commercial →
            </a>
          </div>
        </section>

        {/* ─── MODALITÉS DE PAIEMENT ──────────────────────────── */}
        <section
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "48px 16px 32px",
            borderTop: `1px solid ${C.border}`,
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
            Modalités de paiement
          </div>
          <h2
            style={{
              fontSize: "clamp(20px, 3vw, 26px)",
              fontWeight: 700,
              fontFamily: C.fontSans,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              color: C.text,
            }}
          >
            Paiement par virement bancaire
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: C.textBody,
              fontFamily: C.fontSans,
              lineHeight: 1.6,
              marginBottom: "24px",
              maxWidth: "640px",
            }}
          >
            Harch Atelier n'accepte pas les paiements par carte bancaire en ligne.
            Toutes les factures sont réglées par <strong>virement bancaire</strong> sur
            le compte de Harch Corp. Une facture PDF est émise à la signature du contrat
            et transmise par email. Les coordonnées bancaires (RIB/IBAN) figurent sur
            chaque facture.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                padding: "20px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Échéance
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, fontFamily: C.fontSans }}>
                30 jours nets
              </div>
              <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
                Dès réception de la facture
              </div>
            </div>
            <div
              style={{
                padding: "20px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Devise
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, fontFamily: C.fontSans }}>
                MAD (Dirham marocain)
              </div>
              <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
                EUR/USD sur devis
              </div>
            </div>
            <div
              style={{
                padding: "20px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Facturation
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, fontFamily: C.fontSans }}>
                PDF + email
              </div>
              <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
                Mensuelle ou trimestrielle
              </div>
            </div>
            <div
              style={{
                padding: "20px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Bénéficiaire
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, fontFamily: C.fontSans }}>
                Harch Corp
              </div>
              <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
                Casablanca, Maroc
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: C.textMuted,
              fontFamily: C.fontSans,
              marginTop: "20px",
              lineHeight: 1.5,
            }}
          >
            Pour toute question relative à la facturation, contactez votre commercial
            référent ou écrivez à <a href="mailto:atelier@harchcorp.com" style={{ color: C.accent, textDecoration: "none" }}>atelier@harchcorp.com</a>.
          </p>
        </section>
      </main>

      <div style={{ marginTop: "auto" }}>
        <AtelierFooter />
      </div>
    </div>
  );
}
