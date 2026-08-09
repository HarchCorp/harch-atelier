"use client";

import React, { useState } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — PRICING PAGE
//  4 plans · Tous « Sur devis » · Matrice 24 lignes · FAQ 5 questions
// ═══════════════════════════════════════════════════════════════════════

interface Plan {
  name: string;
  tagline: string;
  highlighted?: boolean;
  bestFor: string;
  capabilities: string[];
  keyFeatures: string[];
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
  },
];

// Matrice de comparaison — 24 lignes × 4 colonnes
interface Row {
  category: string;
  label: string;
  values: [string, string, string, string]; // Essentiel, Pro, Grandes Entreprises, Agences
}

const COMPARISON: Row[] = [
  // ─── Sources & collecte ───────────────────────────────────────
  { category: "Sources & collecte", label: "Sources marocaines surveillées", values: ["20+", "20+", "20+", "20+"] },
  { category: "Sources & collecte", label: "Réseaux sociaux (X, LinkedIn, FB)", values: ["—", "✓", "✓", "✓"] },
  { category: "Sources & collecte", label: "Moteurs IA surveillés", values: ["1", "4", "9", "9"] },
  { category: "Sources & collecte", label: "Langues analysées", values: ["FR", "FR + AR", "FR + AR + EN", "FR + AR + EN"] },
  { category: "Sources & collecte", label: "Entités surveillées", values: ["5", "25", "Illimité", "Illimité / client"] },
  { category: "Sources & collecte", label: "Historique conservé", values: ["90 j", "12 mois", "Illimité", "Illimité"] },
  // ─── Analyse ──────────────────────────────────────────────────
  { category: "Analyse", label: "Score de réputation (5 piliers)", values: ["✓", "✓", "✓", "✓"] },
  { category: "Analyse", label: "Analyse de sentiment par entité", values: ["Hebdo", "Continu", "Continu", "Continu"] },
  { category: "Analyse", label: "32 catégories de risque", values: ["—", "✓", "✓", "✓"] },
  { category: "Analyse", label: "Détection de crises", values: ["Manuel", "Auto", "Auto + prédictif", "Auto + prédictif"] },
  { category: "Analyse", label: "Suivi concurrentiel", values: ["—", "3 concurrents", "Illimité", "Illimité"] },
  // ─── Alertes & livrables ──────────────────────────────────────
  { category: "Alertes & livrables", label: "Alertes email", values: ["✓", "✓", "✓", "✓"] },
  { category: "Alertes & livrables", label: "Alertes WhatsApp", values: ["—", "✓", "✓", "✓"] },
  { category: "Alertes & livrables", label: "Alertes SMS / Teams", values: ["—", "—", "✓", "✓"] },
  { category: "Alertes & livrables", label: "Rapport PDF mensuel", values: ["✓", "✓", "✓", "✓"] },
  { category: "Alertes & livrables", label: "Brief exécutif hebdo", values: ["—", "✓", "✓", "✓"] },
  { category: "Alertes & livrables", label: "Rapports board-ready", values: ["—", "—", "✓", "✓"] },
  // ─── Accès & intégration ──────────────────────────────────────
  { category: "Accès & intégration", label: "Dashboard", values: ["Lecture", "Complet", "Complet + SSO", "White-label"] },
  { category: "Accès & intégration", label: "Utilisateurs", values: ["1", "5", "Illimité", "Illimité"] },
  { category: "Accès & intégration", label: "API lecture", values: ["—", "1k/mois", "100k/mois", "100k/mois"] },
  { category: "Accès & intégration", label: "API écriture + webhooks", values: ["—", "—", "✓", "✓"] },
  { category: "Accès & intégration", label: "SSO / SAML", values: ["—", "—", "✓", "✓"] },
  // ─── Conformité & support ─────────────────────────────────────
  { category: "Conformité & support", label: "Module CNDP / Loi 09-08", values: ["—", "—", "✓", "✓"] },
  { category: "Conformité & support", label: "SLA", values: ["—", "99 %", "99,9 %", "99,9 %"] },
  { category: "Conformité & support", label: "Onboarding dédié", values: ["—", "—", "✓", "✓"] },
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
              maxWidth: "840px",
              margin: "0 auto 20px",
            }}
          >
            Quatre plans. Tous sur devis.
          </h1>
          <p
            style={{
              ...bodyStyle,
              fontSize: "19px",
              maxWidth: "680px",
              margin: "0 auto 32px",
            }}
          >
            Chaque périmètre est différent. Une démo de 30 minutes suffit à
            établir un devis précis — sans engagement, sans carte bancaire.
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent: "center",
              padding: "12px 20px",
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
              borderRadius: "999px",
            }}
          >
            {TRUST.map((t) => (
              <span
                key={t.label}
                style={{
                  fontSize: "12px",
                  fontFamily: C.fontMono,
                  color: C.accent,
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </section>

        {/* ─── PLANS GRID ────────────────────────────────────────── */}
        <section style={{ ...sectionStyle, paddingTop: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "20px",
              alignItems: "stretch",
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
                    fontSize: "22px",
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
                      fontSize: "32px",
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
                      fontSize: "12px",
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
        </section>

        {/* ─── COMPARISON MATRIX ─────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={sectionStyle}>
            <div style={{ marginBottom: "32px" }}>
              <div style={eyebrowStyle}>Comparatif détaillé</div>
              <h2 style={{ ...headingStyle, marginBottom: "12px" }}>
                24 critères. 4 plans.
              </h2>
              <p style={{ ...bodyStyle, maxWidth: "640px" }}>
                Faites défiler horizontalement sur mobile pour comparer.
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
                  minWidth: "720px",
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
                        width: "40%",
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
                          background: p.highlighted ? C.bgSubtle : "transparent",
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
        <section style={sectionStyle}>
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
                  background: C.bgSubtle,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: C.bg,
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
        </section>

        {/* ─── FAQ ───────────────────────────────────────────────── */}
        <section
          style={{
            background: C.bgSubtle,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
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
                      background: C.bg,
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
              href="/atelier/contact"
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
              Parler à un expert →
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
