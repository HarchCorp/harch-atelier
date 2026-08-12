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

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch" | "fix";
  title: string;
  changes: { category: string; items: string[] }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "3.1.0",
    date: "11 août 2026",
    type: "minor",
    title: "Consolidation UX — persistance, accessibilité, statut système",
    changes: [
      { category: "Ajouté", items: [
        "Indicateur SystemStatus dans le footer global — fetch /api/health toutes les 60s, point pulsant vert/rouge, timestamp fr-FR",
        "Hook usePersistentState<T> — état sauvegardé dans localStorage pour l'historique HarchIQ (Agency, Pro, Enterprise)",
        "Compteur de caractères sur le chat HarchIQ Agency (textarea) — 'N / 2000' avec couleur ambre si > 1800",
        "Tooltip Recharts sur la jauge RadialBarChart du Score de Réputation (Agency)",
        "Bouton Copier sur les résultats du Pitch Deck Generator (Agency)",
      ]},
      { category: "Corrigé", items: [
        "HarchIQ Agency Section 13 : <input> mono-ligne → <textarea> auto-extensible avec Shift+Enter pour saut de ligne (parité restaurée vs Section 1)",
        "Historique des conversations HarchIQ : plafond 5/10 → 50, persistance localStorage (survit au refresh/switch client) sur Agency, Pro, Enterprise",
        "Pitch Deck Generator : verrou série supprimé (3 outils en parallèle au lieu de séquentiel)",
        "Pitch Deck Generator : faux état vide 'Pitch deck généré pour prospect [X]' remplacé par un message conditionnel contextuel",
        "Tableau Portfolio Clients (Agency) : a11y clavier — tabIndex, onKeyDown (Entrée/Espace), aria-label, anneau focus-visible (WCAG 2.1 Level A)",
        "Footer 'Dernière maj' (hero Agency Score) : span non-cliquable → bouton cliquable qui déclenche handleRefresh",
      ]},
      { category: "Sécurité", items: [
        "AbortSignal.timeout(4s) sur le fetch SystemStatus — empêche les requêtes pendantes",
      ]},
    ],
  },
  {
    version: "3.0.0",
    date: "21 juillet 2026",
    type: "major",
    title: "Renommage des tiers — grade Corporate & Sovereign",
    changes: [
      { category: "Modifié", items: [
        "Renommage des tiers : Starter / Pro / Enterprise → Émergence / Corporate / Sovereign",
        "Nouvelle grille tarifaire : Émergence 15K · Corporate 40K · Sovereign 75K MAD/mois",
        "Alignement avec les contrats de licence (Executive 450K MAD/an · Sovereign 850K MAD/an)",
        "Tokens renommés : pricingEmergence / pricingCorporate / pricingSovereign (cohérence cosmétique)",
        "Configs backend (lib/config.ts) : IDs alignés avec PricingPage (emergence / corporate / sovereign)",
        "Libellés de rate-limit API : API Corporate (60 req/min) · API Sovereign (600 req/min)",
        "FAQ JSON-LD, section pricing AtelierHome, AuditPage, OurCommitment, LegalPage, ContactPage, Method, ApiMcp, Integrations, ProductsPage, ApiDocs, AskHarchIQ, BroadcastMonitor — toutes les références aux tiers migrées",
        "Positionnement PME / startup remplacé par 'mid-cap structurée' / 'groupe corporate' / 'entité souveraine'",
      ]},
      { category: "Supprimé", items: [
        "Anciens tiers Starter (5K) / Pro (15K) / Enterprise (50K) — purgés des surfaces marketing",
        "Positionnement 'Designed for SMEs and startups' — remplacé par un langage institutionnel",
      ]},
    ],
  },
  {
    version: "2.4.0",
    date: "19 juillet 2026",
    type: "major",
    title: "Mega-menu façon Signal AI + 16 nouvelles pages",
    changes: [
      { category: "Ajouté", items: [
        "Navigation mega-menu avec 6 entrées principales et 41 liens déroulants",
        "5 pages Expertise (Risques Entreprise, Risques Réputation, RP & Comms, ESG, Réglementation)",
        "5 pages Insight Report (Risque, Risque Réputation, Réputation, Impact Média, Deep Dive)",
        "3 pages Approach (Notre IA, Nos Données, Notre Engagement)",
        "Interface de chat IA conversationnel Ask HarchIQ",
        "Page hub Insights avec 14 ressources",
        "Reputation Tracker (jumeau du Risk Tracker)",
        "Page Decision Augmentation (thèse whitepaper Signal AI)",
        "Page Customers avec 4 études de cas",
        "Media Intelligence Report (rétrospective 2026)",
        "Trust Center (sécurité & conformité)",
        "Pages Contact, Careers, Partners, Legal",
      ]},
      { category: "Modifié", items: [
        "Toutes les mentions GLM-4 remplacées par HarchIQ (notre IA entraînable en marque blanche)",
        "Liste des moteurs : ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok",
        "Navigation simplifiée à 6 entrées avec dropdowns mega-menu",
      ]},
    ],
  },
  {
    version: "2.3.0",
    date: "18 juillet 2026",
    type: "major",
    title: "Expansion massive de contenu — News, Blog, Industries, Companies",
    changes: [
      { category: "Ajouté", items: [
        "Bibliothèque de charts : 11 composants SVG réutilisables (BarChart, LineChart, DonutChart, Gauge, Heatmap, Sparkline, RadarChart, StackedBar, StatCard, MetricRow, HorizontalBarChart)",
        "Live News Feed avec 36 articles, 5 filtres, barre de filtres persistante",
        "Blog avec 15 articles SEO (~21 500 mots au total)",
        "6 pages Industry (Banque, Télécom, Mines, Aérien, Retail, Énergie)",
        "5 pages Company (OCP, Attijariwafa, Maroc Telecom, RAM, Bank of Africa)",
        "Template Institutional Audit (PDF 12 pages avec blur teaser)",
        "Moteur Risk Intelligence : 32 catégories de risque, scoring Fréquence × Impact × Vélocité",
        "Harch 100 façon Signal AI 500 avec piliers Innovation / Performance / Purpose",
        "Risk Tracker avec Industry Risk Dashboard",
      ]},
    ],
  },
  {
    version: "2.2.0",
    date: "17 juillet 2026",
    type: "minor",
    title: "Pages Products + Solutions façon Signal AI",
    changes: [
      { category: "Ajouté", items: [
        "Page Products : 5 produits (Platform, API & MCP, Insight Reports, Dashboards, Briefings)",
        "Page Solutions : 4 solutions (Narrative Planning, Threat Sensing, Benchmarking, Media Monitoring)",
        "Page produit Reputation Dashboards avec matrice de matérialité",
        "Page produit Enterprise Risk Intelligence avec matrice des risques",
        "Page produit API & MCP avec exemples de code (Python, TypeScript, cURL, MCP)",
        "Page Integrations (12 intégrations : Slack, Teams, Tableau, PowerBI, Claude, etc.)",
      ]},
      { category: "Modifié", items: [
        "Hero page d'accueil : 'Promouvoir. Protéger. Façonner.' (façon Signal AI)",
        "Stats : 5M+ articles/jour, 100M+ entités, 120+ langues, 32 catégories de risque",
      ]},
    ],
  },
  {
    version: "2.1.0",
    date: "16 juillet 2026",
    type: "fix",
    title: "Corrections critiques SEO + cohérence des données + accessibilité",
    changes: [
      { category: "Corrigé", items: [
        "Bug du double-pipe dans le titre sur 42 pages (title: string → title: { absolute })",
        "URLs canoniques manquant du préfixe /atelier/ (5 pages company + 56 routes sitemap)",
        "Contradictions de données entre pages (scores Harch 100, tendances trimestrielles, niveaux de risque)",
        "Nom de CEO fabriqué 'Mohamed El Kettani' → 'Ismail Douiri' (Attijariwafa)",
        "Plateformes digitales fabriquées 'TawbaTam/TikTal' → 'Tijari' (Attijariwafa)",
        "Réserves de phosphate OCP 31 % → 70 % (était factuellement faux)",
        "Erreur de logique page Énergie 'second-lowest ahead of retail' → 'lowest behind retail'",
        "Suppression du 'Mohammedia refinery fire' fabriqué (Samir fermé depuis 2015)",
        "Accessibilité clavier du mega-menu (aria-expanded, aria-haspopup, onClick, Escape)",
        "Lien skip-to-content ajouté (WCAG 2.4.1)",
        "Lignes dépliables Harch 100 accessibles au clavier (tabIndex, role, aria-expanded, onKeyDown)",
        "Dates du News Feed 2025 → 2026, cartes de stats honnêtes, tags AR corrigés",
      ]},
    ],
  },
  {
    version: "2.0.0",
    date: "15 juillet 2026",
    type: "major",
    title: "Reconstruction du thème clair — AI Reputation Intelligence",
    changes: [
      { category: "Ajouté", items: [
        "Reconstruction complète du thème clair (bg #FAFAFA, accent sage #4A7B5F)",
        "Composant BrandBadge : pattern 'HARCH | Atelier'",
        "Sélecteur de langue FR/EN dans la nav",
        "Classement Harch 100 (façon Signal AI 500)",
        "Risk Tracker (Industry Risk Dashboard)",
        "Templates PDF avec blur teaser (conversion free → paid)",
        "Aperçu du digest quotidien WhatsApp",
      ]},
      { category: "Supprimé", items: [
        "Thème sombre (rejeté par l'utilisateur : 'dégueulasse')",
        "Framing GEO (Generative Engine Optimization) — pivot vers AI Reputation Intelligence",
      ]},
    ],
  },
  {
    version: "1.5.0",
    date: "12 juillet 2026",
    type: "minor",
    title: "Moteur d'intelligence v2 — grade institutionnel",
    changes: [
      { category: "Ajouté", items: [
        "Analyse de sentiment au niveau entité (trilingue FR/AR/EN, lexique 108+ mots)",
        "Clustering de sujets (10 catégories)",
        "Détection de narratifs (5 narratifs dominants avec scoring de force)",
        "Évaluation des risques (0-100, 5 niveaux)",
        "Benchmarking concurrents",
        "Moteur de recommandations (priorisées, avec timeline et owner)",
        "Pipeline d'analyse en 9 étapes (Scrape → Analyze → Score → Rank → Deliver)",
      ]},
    ],
  },
  {
    version: "1.0.0",
    date: "8 juillet 2026",
    type: "major",
    title: "Lancement initial — Harch Atelier",
    changes: [
      { category: "Ajouté", items: [
        "Setup initial Next.js 16 + TypeScript + Turbopack",
        "30+ sources media marocaines et africaines (RSS + agrégation Google News)",
        "Alias d'entreprises pour 12 sociétés marocaines",
        "Google News RSS comme source principale du scraper (48+ articles par entreprise)",
        "Dashboard avec API d'audit en direct",
        "Page tarifs (Starter 5K / Pro 15K / Enterprise 50K MAD/mois)",
      ]},
    ],
  },
];

const TYPE_COLORS = {
  major: { bg: "rgba(74,123,95,0.1)", text: "#4A7B5F", label: "MAJEUR" },
  minor: { bg: "rgba(74,93,110,0.1)", text: "#4A5D6E", label: "MINEUR" },
  patch: { bg: "rgba(184,115,51,0.1)", text: "#B87333", label: "PATCH" },
  fix: { bg: "rgba(160,82,75,0.1)", text: "#A0524B", label: "CORRECTIF" },
};

const CATEGORY_COLORS = {
  Ajouté: "#4A7B5F",
  Modifié: "#4A5D6E",
  Corrigé: "#A0524B",
  Supprimé: "#71717A",
  Obsolète: "#B87333",
};

export default function ChangelogPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
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
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage, animation: "pulse 2s infinite" }} />
            Journal · Mises à jour produit
          </div>
          </Reveal>

          <Reveal delay={0.05}>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px",
          }}>
            Les nouveautés de <span style={{ color: C.sage }}>Harch Atelier.</span>
          </h1>
          </Reveal>

          <Reveal delay={0.1}>
          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "640px",
          }}>
            Chaque mise à jour de la plateforme Harch Atelier — nouvelles
            fonctionnalités, améliorations, correctifs et changements majeurs.
            Abonnez-vous au résumé hebdomadaire pour rester informé.
          </p>
          </Reveal>
        </div>
      </section>

      {/* CHANGELOG ENTRIES */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 16px" }}>
        <StaggerContainer style={{ display: "flex", flexDirection: "column", gap: "48px" }} stagger={0.1}>
          {CHANGELOG.map((entry, i) => {
            const typeColor = TYPE_COLORS[entry.type];
            return (
              <StaggerItem
                key={entry.version}
                style={{
                  position: "relative",
                  paddingBottom: i === CHANGELOG.length - 1 ? 0 : "48px",
                }}
              >
                {/* Timeline line */}
                {i < CHANGELOG.length - 1 && (
                  <div style={{
                    position: "absolute", left: "19px", top: "40px", bottom: "0",
                    width: "2px", background: C.border,
                  }} />
                )}

                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "24px" }}>
                  {/* Timeline dot — pulses when scrolled into view */}
                  <motion.div
                    style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: typeColor.bg, border: `2px solid ${typeColor.text}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: 800, color: typeColor.text,
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0, zIndex: 1,
                    }}
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    ●
                  </motion.div>

                  {/* Entry content */}
                  <div>
                    {/* Header */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      marginBottom: "8px", flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontSize: "24px", fontWeight: 800, color: C.text,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em",
                      }}>
                        v{entry.version}
                      </span>
                      <motion.span
                        style={{
                          fontSize: "10px", fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          padding: "3px 10px", borderRadius: "100px",
                          background: typeColor.bg, color: typeColor.text,
                          letterSpacing: "0.08em",
                          cursor: "default",
                        }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        {typeColor.label}
                      </motion.span>
                      <span style={{
                        fontSize: "12px", color: C.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {entry.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      fontSize: "16px", fontWeight: 700, color: C.text,
                      letterSpacing: "-0.02em", margin: "0 0 20px",
                    }}>
                      {entry.title}
                    </h2>

                    {/* Changes */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {entry.changes.map((change, ci) => {
                        const catColor = CATEGORY_COLORS[change.category as keyof typeof CATEGORY_COLORS] || C.accent;
                        return (
                          <div key={ci}>
                            <div style={{
                              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                              color: catColor, letterSpacing: "0.12em", textTransform: "uppercase",
                              marginBottom: "10px", fontWeight: 700,
                            }}>
                              {change.category}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {change.items.map((item, ii) => (
                                <div key={ii} style={{
                                  display: "flex", gap: "10px",
                                  fontSize: "14px", color: C.textSec, lineHeight: 1.55,
                                }}>
                                  <span style={{ color: catColor, fontWeight: 700, flexShrink: 0 }}>•</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Restez informé
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Recevez la mise à jour produit hebdomadaire.
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Chaque vendredi : nouvelles fonctionnalités, améliorations et
            correctifs. Plus un accès anticipé aux fonctionnalités bêta.
          </p>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "8px", maxWidth: "440px", margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="votre@email.com"
              required
              style={{
                flex: 1, minWidth: "240px",
                padding: "14px 18px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "#FFFFFF",
                fontSize: "14px", fontFamily: "'Inter', sans-serif", outline: "none",
              }}
            />
            <motion.button
              type="submit"
              style={{
                padding: "14px 24px", background: C.sage, color: "#FFFFFF",
                border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
                fontFamily: "'Inter', sans-serif", cursor: "pointer",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              S'abonner →
            </motion.button>
          </form>
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
