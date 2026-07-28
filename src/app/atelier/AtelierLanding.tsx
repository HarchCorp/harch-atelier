"use client";

import { useState, useEffect } from "react";
import BrandBadge from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  Harch Atelier — Landing v3
//  Structure: copied from Nightwatch.io / Profound.com / Otterly.ai
//  Style: Harch Corp — noir + slate + sage + Inter/JetBrains Mono
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#0A0A0A",
  surface1: "#0D0D0D",
  surface2: "#121212",
  surface3: "#141414",
  surface4: "#1A1A1A",
  surface5: "#1E1E1E",
  surface6: "#252525",
  accent: "#8B9DAF",
  accentDark: "#4A5D6E",
  accentBright: "#B8C8D8",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageDim: "#2F4F3F",
  textPrimary: "#FFFFFF",
  textSecondary: "#999999",
  textDim: "#666666",
  textMuted: "rgba(255,255,255,0.62)",
  textFaint: "rgba(255,255,255,0.40)",
  red: "#A0524B",
};

// Sparkline data for dashboard mockup
const SPARKLINE_DATA = [3, 7, 5, 12, 9, 18, 14, 22, 19, 28, 25, 34];
const SPARKLINE_DATA_2 = [1, 2, 4, 3, 6, 8, 7, 12, 15, 18, 22, 28];
const SPARKLINE_DATA_3 = [0, 1, 2, 5, 8, 12, 16, 20, 25, 31, 38, 45];

function Sparkline({ data, color = C.sage, width = 80, height = 24 }: { data: number[]; color?: string; width?: number; height?: number; }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="2" fill={color} />
    </svg>
  );
}

export default function AtelierLanding() {
  useEffect(() => {
    const checkVisibility = () => {
      const sections = document.querySelectorAll('.atelier-root .section:not(.section-visible)');
      sections.forEach((s) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
          s.classList.add('section-visible');
        }
      });
    };
    // Check on mount (for above-fold sections)
    setTimeout(checkVisibility, 100);
    // Check on scroll
    window.addEventListener('scroll', checkVisibility, { passive: true });
    return () => window.removeEventListener('scroll', checkVisibility);
  }, []);

  return (
    <>
      <style>{globalStyles}</style>
      <main className="atelier-root">
        <div className="bg-glow" aria-hidden />
        <div className="bg-grid" aria-hidden />
        <CursorGlow />
        <ScrollProgress />
        <NavBar />
        <Hero />
        <LogoWall />
        <MarketStat />
        <StatsCounter />
        <FeatureSystem />
        <UseCases />
        <Process />
        <Integrations />
        <ComparisonLandscape />
        <BenchmarkTable />
        <DashboardShowcase />
        <Testimonials />
        <MidCTA />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
        <BackToTop />
      </main>
    </>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner">
        <BrandBadge subsidiary="Atelier" href="/" size="md" />
        <nav className="nav-links">
          <a href="#methode" className="nav-link">Méthode</a>
          <a href="#preuves" className="nav-link">Preuves</a>
          <a href="#tarifs" className="nav-link">Tarifs</a>
          <a href="#faq" className="nav-link">FAQ</a>
          <a href="#audit" className="nav-link-cta">Audit gratuit</a>
        </nav>
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          <span className="burger-line" style={{ transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span className="burger-line" style={{ opacity: open ? 0 : 1 }} />
          <span className="burger-line" style={{ transform: open ? "rotate(-45deg) translate(7px, -7px)" : "none" }} />
        </button>
      </div>
      {open && (
        <div className="nav-mobile">
          <a href="#methode" className="nav-mobile-link" onClick={() => setOpen(false)}>Méthode</a>
          <a href="#preuves" className="nav-mobile-link" onClick={() => setOpen(false)}>Preuves</a>
          <a href="#tarifs" className="nav-mobile-link" onClick={() => setOpen(false)}>Tarifs</a>
          <a href="#faq" className="nav-mobile-link" onClick={() => setOpen(false)}>FAQ</a>
          <a href="#audit" className="nav-mobile-cta" onClick={() => setOpen(false)}>Audit gratuit</a>
        </div>
      )}
    </header>
  );
}

// ─── HERO (Nightwatch-style with dashboard mockup) ───────────────
function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="eyebrow">
          Generative Engine Optimization
          <span className="eyebrow-line" aria-hidden />
        </div>
        <h1 className="hero-h1">
          Apparaissez dans les réponses<br />
          des <span className="hero-h1-accent">IA génératives.</span>
        </h1>
        <p className="hero-subhead">
          Le GEO optimise votre visibilité dans ChatGPT, Perplexity, Google AI Overviews et Claude. Audit gratuit en 5 minutes — 200+ requêtes testées sur 4 moteurs IA.
        </p>
        <div className="hero-cta-row">
          <a href="#audit" className="btn-primary">Demander un audit gratuit →</a>
          <a href="#methode" className="btn-secondary">Voir la méthode</a>
        </div>
      </div>
      <DashboardMockup />
    </section>
  );
}

// ─── DASHBOARD MOCKUP (Nightwatch-style, re-skinned Harch) ───────
function DashboardMockup() {
  return (
    <div className="dashboard-mockup">
      <div className="dashboard-glow" aria-hidden />
      <div className="dashboard-window">
        <div className="dashboard-titlebar">
          <div className="dashboard-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="dashboard-url">atelier.harchcorp.com/audit</div>
          <div className="dashboard-status">
            <span className="status-dot" /> Live
          </div>
        </div>
        <div className="dashboard-body">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">NAVIGATION</div>
              <div className="sidebar-item sidebar-item-active">◆ Visibility</div>
              <div className="sidebar-item">◇ Citations</div>
              <div className="sidebar-item">◇ Competitors</div>
              <div className="sidebar-item">◇ Queries</div>
              <div className="sidebar-item">◇ Reports</div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">AI ENGINES</div>
              <div className="sidebar-engine"><span className="engine-dot" style={{ background: C.sage }} /> ChatGPT</div>
              <div className="sidebar-engine"><span className="engine-dot" style={{ background: C.sage }} /> Perplexity</div>
              <div className="sidebar-engine"><span className="engine-dot" style={{ background: C.accent }} /> Google AI</div>
              <div className="sidebar-engine"><span className="engine-dot" style={{ background: C.sage }} /> Claude</div>
            </div>
          </aside>
          {/* Main content */}
          <div className="dashboard-main">
            <div className="dashboard-header">
              <div>
                <div className="dashboard-title">Visibility Overview</div>
                <div className="dashboard-subtitle">harchcorp.com · last 8 weeks</div>
              </div>
              <div className="dashboard-period">
                <span className="period-active">8W</span>
                <span className="period">3M</span>
                <span className="period">1Y</span>
              </div>
            </div>
            <div className="kpi-grid">
              <KPICard label="Citations" value="91" delta="+88" sparkData={SPARKLINE_DATA_3} color={C.sage} />
              <KPICard label="Avg Position" value="2.4" delta="-1.8" sparkData={SPARKLINE_DATA_2} color={C.accent} />
              <KPICard label="Share of Voice" value="38%" delta="+36pts" sparkData={SPARKLINE_DATA} color={C.sage} />
              <KPICard label="Queries Won" value="91/200" delta="+88" sparkData={SPARKLINE_DATA_3} color={C.sage} />
            </div>
            <div className="dashboard-chart">
              <div className="chart-header">
                <div className="chart-title">Brand Visibility Over Time</div>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-dot" style={{ background: C.sage }} /> Harch Corp</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: C.accentDark }} /> Competitor A</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: C.textDim }} /> Competitor B</span>
                </div>
              </div>
              <LineChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, delta, sparkData, color }: { label: string; value: string; delta: string; sparkData: number[]; color: string; }) {
  const isPositive = delta.startsWith("+");
  // Parse numeric value for count-up (strip non-numeric chars like %, /, etc.)
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");
  const [displayValue, setDisplayValue] = useState(0);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!ref || animated) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);
          const duration = 1200;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out-expo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplayValue(numericValue * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, animated, numericValue]);

  const formattedValue = numericValue >= 10
    ? Math.round(displayValue).toString() + suffix
    : displayValue.toFixed(1) + suffix;

  return (
    <div className="kpi-card" ref={setRef}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value-row">
        <div className="kpi-value">{formattedValue}</div>
        <Sparkline data={sparkData} color={color} width={60} height={20} />
      </div>
      <div className={`kpi-delta ${isPositive ? "kpi-delta-up" : "kpi-delta-down"}`}>
        {isPositive ? "▲" : "▼"} {delta}
      </div>
    </div>
  );
}

function LineChart() {
  const w = 600, h = 160;
  const series = [
    { data: [3, 8, 12, 18, 25, 32, 38, 45, 52, 58, 65, 72], color: C.sage, name: "Harch", fillId: "grad-sage" },
    { data: [25, 28, 30, 32, 35, 38, 40, 42, 44, 46, 48, 50], color: C.accentDark, name: "Comp A", fillId: "grad-accent" },
    { data: [40, 38, 42, 40, 44, 42, 46, 44, 48, 46, 50, 48], color: C.textDim, name: "Comp B", fillId: "grad-dim" },
  ];
  const maxVal = 80;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="line-chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad-sage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sage} stopOpacity="0.25" />
          <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad-accent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accentDark} stopOpacity="0.15" />
          <stop offset="100%" stopColor={C.accentDark} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line key={p} x1="0" y1={h * p} x2={w} y2={h * p} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => (
        <line key={p} x1={w * p} y1="0" x2={w * p} y2={h} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
      ))}
      {/* Series with area fill */}
      {series.map((s, idx) => {
        const points = s.data.map((v, i) => {
          const x = (i / (s.data.length - 1)) * w;
          const y = h - (v / maxVal) * h;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        const linePoints = points.join(" ");
        const areaPoints = `0,${h} ${linePoints} ${w},${h}`;
        return (
          <g key={idx}>
            {idx === 0 && <polygon points={areaPoints} fill={`url(#${s.fillId})`} />}
            <polyline points={linePoints} fill="none" stroke={s.color} strokeWidth={idx === 0 ? "2.5" : "1.5"} strokeLinejoin="round" strokeLinecap="round" opacity={idx === 0 ? 1 : 0.6} />
            {idx === 0 && (
              <>
                <circle cx={w} cy={h - (s.data[s.data.length - 1] / maxVal) * h} r="3" fill={s.color} />
                <circle cx={w} cy={h - (s.data[s.data.length - 1] / maxVal) * h} r="7" fill={s.color} opacity="0.2">
                  <animate attributeName="r" values="7;12;7" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── LOGO WALL ───────────────────────────────────────────────────
function LogoWall() {
  const engines = ["ChatGPT", "Perplexity", "Google AI Overviews", "Gemini", "Claude", "Copilot", "Mistral", "Grok"];
  return (
    <section className="logo-wall">
      <div className="logo-wall-label">On couvre les 8 moteurs IA génératifs</div>
      <div className="logo-wall-grid">
        {engines.map((e) => (
          <div key={e} className="logo-item">{e}</div>
        ))}
      </div>
    </section>
  );
}

// ─── MARKET STAT ─────────────────────────────────────────────────
function MarketStat() {
  return (
    <section className="market-stat">
      <div className="market-stat-num">200M+</div>
      <div className="market-stat-label">utilisateurs hebdomadaires actifs sur ChatGPT (OpenAI, août 2024)</div>
      <div className="market-stat-sub">Vos prospects posent des questions aux IA. Si l'IA ne vous cite pas, elle cite un concurrent.</div>
    </section>
  );
}

// ─── FEATURE SYSTEM ──────────────────────────────────────────────
function FeatureSystem() {
  const features = [
    { icon: "◈", title: "Audit 360° IA", desc: "200+ requêtes × 4 moteurs IA. Rapport PDF board-ready 15-20 pages. Recommandations priorisées par impact/effort.", metric: "1 semaine" },
    { icon: "⬡", title: "Entity Optimization", desc: "Entités nommées structurées, Schema.org JSON-LD, contenu E-E-A-T. Les LLMs vous identifient comme source citable.", metric: "2-4 semaines" },
    { icon: "↗", title: "Citation Monitoring", desc: "Suivi mensuel des citations sur 4 moteurs IA. Alertes variations. Rapport mensuel + appel 30 min.", metric: "Mensuel" },
    { icon: "▦", title: "Competitor Tracking", desc: "Part de voix vs concurrents directs. Qui monte, qui descend. Position moyenne dans les réponses IA.", metric: "Temps réel" },
    { icon: "⌬", title: "Multilingual Coverage", desc: "Français, arabe, anglais. Couverture native francophone : FR, MA, BE, CH, QC, TN, LB, SN.", metric: "8 pays" },
    { icon: "▤", title: "AEO Files", desc: "FAQ, définitions, résumés extractibles par les LLMs. Contenu structuré pour citation directe.", metric: "Inclus" },
  ];
  return (
    <section id="methode" className="section">
      <SectionLabel>La plateforme</SectionLabel>
      <h2 className="h2">Six modules. Un seul engagement.</h2>
      <p className="section-subhead">
        GEO n'est pas un service unique. C'est un système intégré — audit, optimisation, monitoring, suivi concurrentiel, multilingue, fichiers AEO. Tout est livré, rien n'est retenu.
      </p>
      <div className="feature-grid">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-top-line" aria-hidden />
            <div className="feature-header">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-metric">{f.metric}</div>
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PROCESS (closed-loop, Goodie-style numbered) ────────────────
function Process() {
  const steps = [
    { num: "01", name: "Research", desc: "200+ requêtes testées sur 4 moteurs IA. Identification des gaps, des concurrents cités à votre place, des entités manquantes.", deliverable: "Rapport PDF 15-20 pages" },
    { num: "02", name: "Optimize", desc: "Structuration sémantique, Schema.org JSON-LD, contenu E-E-A-T, fichiers AEO. Code livré sur repo GitHub privé.", deliverable: "Setup complet 2-4 semaines" },
    { num: "03", name: "Monitor", desc: "Retest mensuel des 200+ requêtes. Suivi des citations, variations concurrentielles, mises à jour de contenu incluses.", deliverable: "Rapport mensuel + appel 30 min" },
    { num: "04", name: "Measure", desc: "Trois métriques structurantes : citations/200, part de voix vs concurrents, position moyenne. Traçables mois par mois.", deliverable: "Dashboard + KPI tracking" },
  ];
  return (
    <section className="section">
      <SectionLabel>Le process</SectionLabel>
      <h2 className="h2">Boucle fermée. 04 étapes.</h2>
      <p className="section-subhead">
        Research → Optimize → Monitor → Measure. Chaque étape a un livrable concret, mesurable, sans jargon.
      </p>
      <div className="process-flow">
        {steps.map((s, i) => (
          <div key={s.num} className="process-step-wrapper">
            <div className="process-step">
              <div className="process-num">{s.num}</div>
              <div className="process-name">{s.name}</div>
              <p className="process-desc">{s.desc}</p>
              <div className="process-deliverable">{s.deliverable}</div>
            </div>
            {i < steps.length - 1 && <div className="process-connector" aria-hidden>
              <div className="process-connector-line" />
              <div className="process-connector-arrow">→</div>
            </div>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── COMPARISON LANDSCAPE (Nightwatch-style 3-column) ────────────
function ComparisonLandscape() {
  return (
    <section id="comparaison" className="section">
      <SectionLabel>Le marché</SectionLabel>
      <h2 className="h2">SEO seul. GEO seul. Harch les deux.</h2>
      <p className="section-subhead">
        Les outils legacy font du SEO. Les nouveaux outils font du GEO. Personne ne fait les deux — sauf Harch Atelier.
      </p>
      <div className="landscape-grid">
        <div className="landscape-col landscape-col-dim">
          <div className="landscape-header">Outils SEO legacy</div>
          <div className="landscape-status landscape-status-gap">Gap</div>
          <ul className="landscape-list">
            <li className="landscape-item landscape-item-missing">✗ Google Search only</li>
            <li className="landscape-item landscape-item-missing">✗ Pas de citation IA</li>
            <li className="landscape-item landscape-item-missing">✗ Pas de suivi LLM</li>
            <li className="landscape-item landscape-item-missing">✗ Pas de multilingue</li>
            <li className="landscape-item landscape-item-missing">✗ Timeline 6-12 mois</li>
          </ul>
        </div>
        <div className="landscape-col landscape-col-featured">
          <div className="landscape-header landscape-header-featured">Harch Atelier</div>
          <div className="landscape-status landscape-status-complete">Complete</div>
          <ul className="landscape-list">
            <li className="landscape-item landscape-item-present">✓ Google + 4 moteurs IA</li>
            <li className="landscape-item landscape-item-present">✓ Citation tracking</li>
            <li className="landscape-item landscape-item-present">✓ LLM monitoring</li>
            <li className="landscape-item landscape-item-present">✓ FR · AR · EN natifs</li>
            <li className="landscape-item landscape-item-present">✓ Timeline 2-4 semaines</li>
          </ul>
        </div>
        <div className="landscape-col landscape-col-dim">
          <div className="landscape-header">Outils GEO US-only</div>
          <div className="landscape-status landscape-status-gap">Gap</div>
          <ul className="landscape-list">
            <li className="landscape-item landscape-item-missing">✗ Anglais only</li>
            <li className="landscape-item landscape-item-missing">✗ Pas de marché francophone</li>
            <li className="landscape-item landscape-item-missing">✗ Tarifs US $3-15K/mois</li>
            <li className="landscape-item landscape-item-missing">✗ Pas de virement bancaire</li>
            <li className="landscape-item landscape-item-missing">✗ Pas de présence locale</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── BENCHMARK TABLE (Nightwatch-style quantified) ───────────────
function BenchmarkTable() {
  const rows = [
    { metric: "Citation accuracy", harch: "94%", industry: "62%", delta: "+32pts" },
    { metric: "Data freshness", harch: "Hebdomadaire", industry: "Mensuel", delta: "4× plus rapide" },
    { metric: "Localization depth", harch: "8 pays francophones", industry: "US-only", delta: "+8 marchés" },
    { metric: "Cost-efficiency", harch: "5-15K MAD/mois", industry: "$3-15K USD/mois", delta: "5× moins cher" },
    { metric: "Setup time", harch: "2-4 semaines", industry: "8-16 semaines", delta: "3× plus rapide" },
    { metric: "Languages covered", harch: "FR · AR · EN", industry: "EN only", delta: "+2 langues" },
  ];
  return (
    <section id="preuves" className="section">
      <SectionLabel>Benchmark</SectionLabel>
      <h2 className="h2">Harch vs Industry Average.</h2>
      <p className="section-subhead">
        Comparaison sur 6 métriques structurantes. Données issues de l'audit interne et des benchmarks publics des outils US.
      </p>
      <div className="benchmark-card">
        <table className="benchmark-table">
          <thead>
            <tr>
              <th className="benchmark-th">Métrique</th>
              <th className="benchmark-th benchmark-th-harch">Harch Atelier</th>
              <th className="benchmark-th">Industry Average</th>
              <th className="benchmark-th benchmark-th-delta">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.metric}>
                <td className="benchmark-td benchmark-td-metric">{r.metric}</td>
                <td className="benchmark-td benchmark-td-harch">{r.harch}</td>
                <td className="benchmark-td benchmark-td-industry">{r.industry}</td>
                <td className="benchmark-td benchmark-td-delta">▲ {r.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="case-grid">
        <CaseStudy
          name="legal-seed.com"
          sector="Legaltech"
          before="0/200 requêtes juridiques"
          after="67/200 — 4 moteurs"
          timeline="6 semaines"
          quote="ChatGPT et Perplexity commencent à nous citer comme source juridique de référence en trois semaines."
          attribution="Fondateur, legal-seed.com"
        />
        <CaseStudy
          name="ciment-dam.com"
          sector="Industrie cimentière"
          before="Invisible sur 4 moteurs"
          after="41/200 — 3 moteurs"
          timeline="5 semaines"
          quote="On apparaît enfin dans Perplexity quand un prospect cherche un fournisseur cimentier."
          attribution="Direction, ciment-dam.com"
        />
      </div>
    </section>
  );
}

function CaseStudy({ name, sector, before, after, timeline, quote, attribution }: { name: string; sector: string; before: string; after: string; timeline: string; quote: string; attribution: string; }) {
  return (
    <div className="case-card">
      <div className="feature-top-line" aria-hidden />
      <div className="case-header">
        <div>
          <div className="case-name">{name}</div>
          <div className="case-sector">{sector}</div>
        </div>
        <div className="case-timeline">{timeline}</div>
      </div>
      <div className="case-row">
        <div className="case-label">Avant</div>
        <div className="case-value-before">{before}</div>
      </div>
      <div className="case-row">
        <div className="case-label">Après</div>
        <div className="case-value-after">{after}</div>
      </div>
      <blockquote className="case-quote">
        « {quote} »
        <cite className="case-cite">— {attribution}</cite>
      </blockquote>
    </div>
  );
}

// ─── DASHBOARD SHOWCASE (full audit report mockup) ───────────────
function DashboardShowcase() {
  return (
    <section className="section">
      <SectionLabel>Le dashboard</SectionLabel>
      <h2 className="h2">Votre audit, en temps réel.</h2>
      <p className="section-subhead">
        200+ requêtes × 4 moteurs IA. Citations, position moyenne, part de voix. Tout est traçable, tout est mesurable, tout est livré.
      </p>
      <div className="audit-mockup">
        <div className="audit-window">
          <div className="dashboard-titlebar">
            <div className="dashboard-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="dashboard-url">atelier.harchcorp.com/audit/legal-seed</div>
            <div className="dashboard-status"><span className="status-dot" /> Week 6</div>
          </div>
          <div className="audit-body">
            <div className="audit-sidebar">
              <div className="sidebar-label">QUERY CATEGORIES</div>
              <div className="audit-cat audit-cat-active">Avocat droit du travail</div>
              <div className="audit-cat">Contrat de travail</div>
              <div className="audit-cat">Licenciement</div>
              <div className="audit-cat">Harcelement</div>
              <div className="audit-cat">Négociation</div>
              <div className="audit-cat">Statut freelance</div>
            </div>
            <div className="audit-main">
              <div className="audit-row audit-row-header">
                <div className="audit-col-query">Query</div>
                <div className="audit-col-engine">ChatGPT</div>
                <div className="audit-col-engine">Perplexity</div>
                <div className="audit-col-engine">Google AI</div>
                <div className="audit-col-engine">Claude</div>
                <div className="audit-col-pos">Position</div>
              </div>
              {[
                { q: "meilleur avocat droit du travail Paris", e: ["✓", "✓", "✓", "✓"], p: "#1" },
                { q: "consultation avocat licenciement", e: ["✓", "✓", "—", "✓"], p: "#2" },
                { q: "avocat spécialisé harcèlement", e: ["✓", "✓", "✓", "—"], p: "#1" },
                { q: "contrat de travail avocat", e: ["✓", "—", "✓", "✓"], p: "#3" },
                { q: "avocat négociation rupture", e: ["—", "✓", "✓", "✓"], p: "#2" },
                { q: "statut freelance avocat", e: ["✓", "✓", "—", "✓"], p: "#1" },
              ].map((row, i) => (
                <div key={i} className="audit-row">
                  <div className="audit-col-query">{row.q}</div>
                  <div className="audit-col-engine">{row.e[0]}</div>
                  <div className="audit-col-engine">{row.e[1]}</div>
                  <div className="audit-col-engine">{row.e[2]}</div>
                  <div className="audit-col-engine">{row.e[3]}</div>
                  <div className="audit-col-pos">{row.p}</div>
                </div>
              ))}
              <div className="audit-summary">
                <div className="audit-summary-item">
                  <div className="audit-summary-label">Citations</div>
                  <div className="audit-summary-value">67 / 200</div>
                </div>
                <div className="audit-summary-item">
                  <div className="audit-summary-label">Avg Position</div>
                  <div className="audit-summary-value">#2.4</div>
                </div>
                <div className="audit-summary-item">
                  <div className="audit-summary-label">Share of Voice</div>
                  <div className="audit-summary-value">34%</div>
                </div>
                <div className="audit-summary-item">
                  <div className="audit-summary-label">Engines Covered</div>
                  <div className="audit-summary-value">4 / 4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING (with Monthly/Yearly toggle) ────────────────────────
function Pricing() {
  const [yearly, setYearly] = useState(false);
  const tiers = [
    {
      label: "Tier 01",
      name: "Audit",
      priceMonthly: 0,
      priceYearly: 0,
      currency: "MAD",
      period: "1 semaine · sans engagement",
      items: ["200+ requêtes × 4 moteurs IA", "Rapport PDF board-ready 15-20p", "Analyse concurrentielle", "Recommandations priorisées", "Appel de présentation 30 min", "Sans email gate, sans CB"],
      footer: "Gratuit. Le rapport vous appartient.",
      featured: false,
      cta: "Demander l'audit",
    },
    {
      label: "Tier 02",
      name: "Studio",
      priceMonthly: 10000,
      priceYearly: 8000,
      currency: "MAD/mois",
      period: yearly ? "engagement annuel · 20% off" : "mensuel · résiliable 30j",
      items: ["Tout Audit inclus", "Structuration sémantique + Schema.org", "Contenu E-E-A-T + fichiers AEO", "Monitoring 4 moteurs IA", "Rapport mensuel + appel 30 min", "Code source sur GitHub privé"],
      footer: yearly ? "Facturé annuellement · 96K MAD/an" : "Mensuel · 5-15K MAD selon périmètre",
      featured: true,
      cta: "Démarrer le Studio",
    },
    {
      label: "Tier 03",
      name: "Enterprise",
      priceMonthly: -1,
      priceYearly: -1,
      currency: "sur devis",
      period: "multi-marques · multi-pays",
      items: ["Tout Studio inclus", "Multi-marques / multi-sites", "Couverture 8 pays francophones", "Account manager dédié", "Quarterly business review", "SLA 24h ouvrées"],
      footer: "Sur devis. Idéal 5+ marques.",
      featured: false,
      cta: "Contacter",
    },
  ];
  return (
    <section id="tarifs" className="section">
      <SectionLabel>Tarifs</SectionLabel>
      <h2 className="h2">Trois offres. Virement bancaire.</h2>
      <p className="section-subhead">
        Pas de Stripe, pas de carte bancaire, pas d'abonnement piégé. Virement bancaire (RIB marocain, IBAN français, international). Facture PDF simple.
      </p>
      <div className="pricing-toggle">
        <button className={`toggle-btn ${!yearly ? "toggle-btn-active" : ""}`} onClick={() => setYearly(false)}>Mensuel</button>
        <button className={`toggle-btn ${yearly ? "toggle-btn-active" : ""}`} onClick={() => setYearly(true)}>Annuel <span className="toggle-save">-20%</span></button>
      </div>
      <div className="pricing-grid">
        {tiers.map((t) => (
          <div key={t.name} className={`tier ${t.featured ? "tier-featured" : ""}`}>
            <div className="feature-top-line" aria-hidden />
            {t.featured && <div className="tier-badge">Recommandé</div>}
            <div className="tier-label">{t.label}</div>
            <h3 className="tier-name">{t.name}</h3>
            <div className="tier-price">
              {t.priceMonthly === -1 ? (
                <span className="tier-price-custom">Sur devis</span>
              ) : t.priceMonthly === 0 ? (
                <span className="tier-price-free">Gratuit</span>
              ) : (
                <>
                  <span className="tier-price-num">{yearly ? t.priceYearly : t.priceMonthly}</span>
                  <span className="tier-price-currency"> {t.currency}</span>
                </>
              )}
            </div>
            <div className="tier-period">{t.period}</div>
            <ul className="tier-list">
              {t.items.map((it, i) => (
                <li key={i} className="tier-item">
                  <span className="tier-check">✓</span>
                  {it}
                </li>
              ))}
            </ul>
            <div className="tier-footer">{t.footer}</div>
            <a href="#audit" className={`tier-cta ${t.featured ? "btn-primary" : "btn-secondary"}`}>{t.cta} →</a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────
function FAQ() {
  const faqs = [
    { q: "Qu'est-ce que le GEO ?", a: "Le GEO (Generative Engine Optimization) optimise votre visibilité dans les moteurs IA génératifs : ChatGPT, Perplexity, Gemini, Claude. Contrairement au SEO qui cible les liens bleus de Google, le GEO cible les réponses synthétisées par les LLMs. Il agit sur les entités nommées, les données structurées Schema.org, et le contenu E-E-A-T." },
    { q: "Comment apparaître dans ChatGPT ?", a: "Votre contenu doit être compréhensible et citable par les LLMs : entités nommées structurées, données Schema.org, sources autoritaires, contenu E-E-A-T. Harch Atelier audite 200+ requêtes sur 4 moteurs IA pour identifier les gaps. Les premières citations apparaissent en 2-4 semaines après le début du Setup." },
    { q: "Quelle différence entre SEO et GEO ?", a: "Le SEO optimise pour le crawler Google et les liens bleus. Le GEO optimise pour les LLMs et les réponses synthétisées. Une page qui rank en position 1 sur Google peut être invisible dans ChatGPT, et inversement. SEO et GEO sont complémentaires, pas concurrents." },
    { q: "Combien coûte le GEO ?", a: "Trois tarifs : Audit gratuit (1 semaine), Studio 5-15K MAD/mois (mensuel, résiliable 30j) ou 8-12K MAD/mois en engagement annuel (-20%), Enterprise sur devis (multi-marques). Paiement par virement bancaire. Pas de Stripe, pas de carte bancaire." },
    { q: "Le GEO fonctionne-t-il en français ?", a: "Oui. Harch Atelier est conçu pour les marchés francophones : France, Maroc, Belgique, Suisse, Québec, Tunisie, Liban, Sénégal. Le contenu français est moins concurrentiel que l'anglais sur les requêtes IA, ce qui accélère les premiers résultats — typiquement 2-4 semaines pour la première citation." },
    { q: "Combien de temps pour voir les résultats ?", a: "Les premières citations apparaissent en 2-4 semaines après le début du Setup. Perplexity est le moteur le plus rapide (2-4 semaines). Claude progresse vite en francophone (3-4 semaines). ChatGPT demande 4-8 semaines. Google AI Overviews est le plus lent (8-16 semaines)." },
    { q: "Le GEO remplace-t-il le SEO ?", a: "Non. Le SEO reste nécessaire pour Google Search. Le GEO s'ajoute pour couvrir les IA génératives. Les deux disciplines partagent des bonnes pratiques mais diffèrent sur la cible finale : liens bleus vs réponses synthétisées. La stratégie mature combine les deux." },
    { q: "Comment mesurer le ROI du GEO ?", a: "Trois métriques structurantes : (1) nombre de requêtes sur 200 qui citent votre marque, par moteur IA ; (2) part de voix vs concurrents directs ; (3) position moyenne dans les citations. Le rapport mensuel inclut ces trois métriques, retraçables mois par mois." },
    { q: "Le GEO fonctionne-t-il pour les PME ?", a: "Oui. Le GEO est particulièrement adapté aux PME : marché des IA moins saturé que Google Search, contenu structuré qui compense la taille de domaine, requêtes IA plus conversationnelles (long-tail). Une PME peut apparaître dans ChatGPT là où elle n'apparaît pas en page 1 Google." },
    { q: "Quels livrables concrets ?", a: "Phase Audit : rapport PDF 15-20 pages, 200+ requêtes × 4 moteurs IA. Phase Studio : contenu optimisé, Schema.org JSON-LD, fichiers AEO, code source sur repo GitHub privé. Phase Monitor : rapport mensuel PDF + appel 30 min, retest des requêtes, mises à jour incluses. Tout est livré." },
  ];
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="section">
      <SectionLabel>FAQ</SectionLabel>
      <h2 className="h2">Les questions qu'on nous pose.</h2>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <div key={i} className="faq-item">
            <button className="faq-question" onClick={() => setOpenIdx(openIdx === i ? null : i)} aria-expanded={openIdx === i}>
              <span className="faq-question-text">{f.q}</span>
              <span className="faq-chevron" style={{ transform: openIdx === i ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            <div className={`faq-answer-wrapper ${openIdx === i ? "faq-answer-open" : ""}`}>
              <div className="faq-answer">{f.a}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FINAL CTA ───────────────────────────────────────────────────
function FinalCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", website: "", sector: "" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  return (
    <section id="audit" className="section section-cta">
      <SectionLabel>Start</SectionLabel>
      <h2 className="h2">Audit gratuit. Sans engagement.</h2>
      <p className="section-subhead">
        Cinq minutes pour remplir le formulaire. Une semaine pour l'audit. Un rapport PDF prêt à présenter.
      </p>
      <div className="cta-card">
        <div className="feature-top-line" aria-hidden />
        {submitted ? (
          <div className="success-msg">
            <div className="success-title">✓ Demande reçue</div>
            <p className="success-body">
              On lance l'audit et on vous envoie le PDF sous 7 jours ouvrés. Question immédiate : <a href="mailto:atelier@harchcorp.com" className="link-inline">atelier@harchcorp.com</a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row-2">
              <label className="form-label">
                <span className="form-label-text">Nom</span>
                <input type="text" required placeholder="Prénom Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </label>
              <label className="form-label">
                <span className="form-label-text">Email professionnel</span>
                <input type="email" required placeholder="vous@entreprise.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
              </label>
            </div>
            <div className="form-row-2">
              <label className="form-label">
                <span className="form-label-text">Site web</span>
                <input type="url" required placeholder="https://votre-entreprise.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input" />
              </label>
              <label className="form-label">
                <span className="form-label-text">Secteur (optionnel)</span>
                <input type="text" placeholder="SaaS, legaltech, industrie..." value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="input" />
              </label>
            </div>
            <button type="submit" className="btn-primary">Obtenir l'audit gratuit →</button>
            <div className="trust-signals">
              <div className="trust-item">✓ Pas d'email gate — le PDF vous est envoyé directement</div>
              <div className="trust-item">✓ Pas de spam — votre email n'est jamais revendu</div>
              <div className="trust-item">✓ Pas de carte bancaire — audit gratuit, sans Stripe</div>
              <div className="trust-item">✓ Réponse sous 24h ouvrées</div>
              <div className="trust-item">✓ Conforme Loi 09-08 (Maroc) + RGPD (UE)</div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────
function Footer() {
  const countries = [
    { code: "FR", name: "France", cities: "Paris · Lyon · Marseille" },
    { code: "MA", name: "Maroc", cities: "Casablanca · Rabat · Marrakech" },
    { code: "BE", name: "Belgique", cities: "Bruxelles · Anvers" },
    { code: "CH", name: "Suisse", cities: "Genève · Lausanne · Zurich" },
    { code: "QC", name: "Québec", cities: "Montréal · Québec City" },
    { code: "TN", name: "Tunisie", cities: "Tunis · Sfax" },
    { code: "LB", name: "Liban", cities: "Beyrouth" },
    { code: "SN", name: "Sénégal", cities: "Dakar" },
  ];
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand-block">
          <BrandBadge subsidiary="Atelier" href="/" size="md" />
          <p className="footer-tagline">GEO for the francophone world.</p>
          <div className="footer-contact">
            <a href="mailto:atelier@harchcorp.com" className="footer-link">atelier@harchcorp.com</a>
            <span className="footer-dim">·</span>
            <a href="tel:+212684440682" className="footer-link">+212 684 440 682</a>
          </div>
          <a href="https://harchcorp.com" className="footer-link footer-parent">→ harchcorp.com</a>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <div className="footer-col-title">Navigation</div>
            <a href="#methode" className="footer-link">Méthode</a>
            <a href="#preuves" className="footer-link">Preuves</a>
            <a href="#tarifs" className="footer-link">Tarifs</a>
            <a href="#faq" className="footer-link">FAQ</a>
            <a href="#audit" className="footer-link">Audit gratuit</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Méthode</div>
            <a href="#methode" className="footer-link">Phase 1 — Audit</a>
            <a href="#methode" className="footer-link">Phase 2 — Optimize</a>
            <a href="#methode" className="footer-link">Phase 3 — Monitor</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Ressources</div>
            <a href="#comparaison" className="footer-link">SEO vs GEO</a>
            <a href="#preuves" className="footer-link">Benchmark</a>
            <a href="#faq" className="footer-link">FAQ GEO</a>
          </div>
        </div>
      </div>

      <div className="footer-countries">
        <div className="footer-col-title">8 marchés francophones couverts</div>
        <div className="countries-grid">
          {countries.map((c) => (
            <div key={c.code} className="country-item">
              <span className="country-code">{c.code}</span>
              <div>
                <div className="country-name">{c.name}</div>
                <div className="country-cities">{c.cities}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal">Building in Public, depuis 2024 · Casablanca, Maroc</div>
        <div className="footer-legal">Harch Atelier est une activité de Harch Corp · Virement bancaire</div>
      </div>
    </footer>
  );
}

// ─── CURSOR GLOW (subtle sage glow that follows cursor) ──────────
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      className="cursor-glow"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
      aria-hidden
    />
  );
}

// ─── SCROLL PROGRESS BAR ─────────────────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setProgress(total > 0 ? (current / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden />
  );
}

// ─── STATS COUNTER (animated big numbers) ────────────────────────
function StatsCounter() {
  const stats = [
    { num: 200, suffix: "+", label: "Requêtes par audit", sub: "testées sur 4 moteurs IA" },
    { num: 8, suffix: "", label: "Pays francophones", sub: "FR · MA · BE · CH · QC · TN · LB · SN" },
    { num: 4, suffix: "", label: "Moteurs IA couverts", sub: "ChatGPT · Perplexity · Gemini · Claude" },
    { num: 91, suffix: "/200", label: "Citations Harch Corp", sub: "après 8 semaines de GEO (dogfooding)" },
  ];
  return (
    <section className="section stats-counter-section">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <StatItem key={i} {...s} />
        ))}
      </div>
    </section>
  );
}

function StatItem({ num, suffix, label, sub }: { num: number; suffix: string; label: string; sub: string }) {
  const [value, setValue] = useState(0);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!ref || animated) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);
          const dur = 1500;
          const start = Date.now();
          const tick = () => {
            const p = Math.min((Date.now() - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            setValue(num * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref, animated, num]);

  const display = num >= 10 ? Math.round(value) : value.toFixed(0);

  return (
    <div className="stat-item" ref={setRef}>
      <div className="stat-num">
        {display}<span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

// ─── USE CASES BY PERSONA ────────────────────────────────────────
function UseCases() {
  const [active, setActive] = useState(0);
  const cases = [
    {
      icon: "⚙",
      name: "SaaS B2B",
      title: "SaaS B2B francophones",
      query: "« meilleur logiciel de [votre catégorie] en France »",
      desc: "Vos prospects demandent à ChatGPT de comparer les outils. Si vous n'êtes pas cité dans le top 3, vous perdez des trials chaque semaine. On structure votre contenu pour que les LLMs vous identifient comme la référence.",
      kpis: ["Trials +34%", "Citations ChatGPT en 3 sem.", "Position moyenne #2.1"],
    },
    {
      icon: "⚖",
      name: "Legaltech",
      title: "Cabinets d'avocats & legaltech",
      query: "« meilleur avocat [spécialité] à [ville] »",
      desc: "Vos clients cherchent un avocat par spécialité et ville. ChatGPT cite les cabinets qui ont du contenu structuré E-E-A-T. On transforme votre expertise juridique en contenu citable par les IA.",
      kpis: ["Leads +52%", "Citations 4 moteurs en 6 sem.", "Part de voix 34%"],
    },
    {
      icon: "🏭",
      name: "Industrie B2B",
      title: "Industrie & manufacturing",
      query: "« fournisseur [produit] B2B [pays] »",
      desc: "Les acheteurs industriels comparent les fournisseurs via Perplexity et Google AI Overviews. On rend votre catalogue et vos specs techniques compréhensibles par les LLMs pour apparaître dans les comparatifs.",
      kpis: ["RFQ +28%", "3 moteurs en 5 sem.", "Citations sectorielles 41/200"],
    },
    {
      icon: "🛍",
      name: "E-commerce",
      title: "Marques e-commerce premium",
      query: "« recommande-moi [produit] de qualité »",
      desc: "Les consommateurs demandent des recommandations produits aux IA. On optimise vos fiches produits, vos avis clients et votre contenu de marque pour que ChatGPT cite votre boutique comme option recommandée.",
      kpis: ["Trafic IA +67%", "Conversion +12%", "Citations en 4 sem."],
    },
    {
      icon: "🏥",
      name: "Santé",
      title: "Cliniques & centres de santé",
      query: "« meilleure clinique [spécialité] à [ville] »",
      desc: "Les patients cherchent des établissements de santé via les IA. On structure votre présence en ligne (équipe médicale, spécialités, équipements) pour que les LLMs vous recommandent dans les requêtes locales.",
      kpis: ["RDV +41%", "Citations locales en 3 sem.", "Position #1 sur 12 requêtes"],
    },
    {
      icon: "🏨",
      name: "Hospitality",
      title: "Hôtels & hospitality de luxe",
      query: "« best luxury hotel in [city] »",
      desc: "Les touristes internationaux demandent des recommandations d'hôtels aux IA en anglais et en français. On optimise votre présence pour apparaître dans les réponses des 4 moteurs, peu importe la langue du prospect.",
      kpis: ["Réservations directes +23%", "Citations 4 moteurs", "Position top 3 international"],
    },
  ];
  const current = cases[active];
  return (
    <section className="section">
      <SectionLabel>Use cases</SectionLabel>
      <h2 className="h2">Six secteurs. Même méthode.</h2>
      <p className="section-subhead">
        Le GEO s'applique partout où vos prospects posent des questions aux IA. Cliquez sur votre secteur pour voir les KPIs typiques.
      </p>
      <div className="usecase-layout">
        <div className="usecase-tabs">
          {cases.map((c, i) => (
            <button
              key={i}
              className={`usecase-tab ${i === active ? "usecase-tab-active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="usecase-tab-icon">{c.icon}</span>
              <span className="usecase-tab-name">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="usecase-content" key={active}>
          <div className="feature-top-line" aria-hidden />
          <div className="usecase-header">
            <div className="usecase-icon-big">{current.icon}</div>
            <div>
              <h3 className="usecase-title">{current.title}</h3>
              <div className="usecase-query">{current.query}</div>
            </div>
          </div>
          <p className="usecase-desc">{current.desc}</p>
          <div className="usecase-kpis">
            {current.kpis.map((k, i) => (
              <div key={i} className="usecase-kpi">
                <span className="usecase-kpi-check">✓</span>
                {k}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── INTEGRATIONS / TRUST BAND ────────────────────────────────────
function Integrations() {
  const tools = [
    { name: "Schema.org", desc: "JSON-LD structured data" },
    { name: "Wikidata", desc: "Entity signals" },
    { name: "GitHub", desc: "Code delivery, private repo" },
    { name: "llms.txt", desc: "AI-readable index" },
    { name: "E-E-A-T", desc: "Expertise · Experience · Authority · Trust" },
    { name: "OpenGraph", desc: "Social sharing metadata" },
  ];
  return (
    <section className="section integrations-section">
      <div className="integrations-inner">
        <div className="integrations-label">On travaille avec les standards ouverts</div>
        <div className="integrations-grid">
          {tools.map((t) => (
            <div key={t.name} className="integration-item">
              <div className="integration-name">{t.name}</div>
              <div className="integration-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────
function Testimonials() {
  const items = [
    {
      quote: "ChatGPT et Perplexity commencent à nous citer comme source juridique de référence en trois semaines.",
      name: "Fondateur",
      company: "legal-seed.com",
      sector: "Legaltech",
      metric: "0 → 67/200 citations",
      timeline: "6 semaines",
    },
    {
      quote: "On apparaît enfin dans Perplexity quand un prospect cherche un fournisseur cimentier.",
      name: "Direction",
      company: "ciment-dam.com",
      sector: "Industrie cimentière",
      metric: "0 → 41/200 citations",
      timeline: "5 semaines",
    },
    {
      quote: "Le rapport d'audit board-ready m'a permis de présenter le sujet au comité de direction sans prep supplémentaire.",
      name: "CMO",
      company: "Client SaaS B2B",
      sector: "SaaS",
      metric: "Audit livré en 7 jours",
      timeline: "Phase 1",
    },
  ];
  return (
    <section className="section">
      <SectionLabel>Témoignages</SectionLabel>
      <h2 className="h2">Ce que disent les clients.</h2>
      <p className="section-subhead">
        Trois retours, trois secteurs, trois timelines. Mesurés sur 200 requêtes × 4 moteurs IA.
      </p>
      <div className="testimonials-grid">
        {items.map((t, i) => (
          <div key={i} className="testimonial-card">
            <div className="feature-top-line" aria-hidden />
            <div className="testimonial-metric">
              <div className="testimonial-metric-value">{t.metric}</div>
              <div className="testimonial-metric-timeline">{t.timeline}</div>
            </div>
            <blockquote className="testimonial-quote">
              « {t.quote} »
            </blockquote>
            <div className="testimonial-author">
              <div className="testimonial-avatar" aria-hidden>
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-company">{t.company} · {t.sector}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MID CTA BANNER ──────────────────────────────────────────────
function MidCTA() {
  return (
    <section className="mid-cta-section">
      <div className="mid-cta-card">
        <div className="mid-cta-glow" aria-hidden />
        <div className="mid-cta-content">
          <div className="mid-cta-eyebrow">Audit gratuit · 5 minutes</div>
          <h2 className="mid-cta-title">
            Voyez ce que ChatGPT dit de vous —<br />
            <span className="mid-cta-title-accent">ou ne dit pas.</span>
          </h2>
          <p className="mid-cta-sub">
            200+ requêtes testées sur 4 moteurs IA. Rapport PDF board-ready livré en 1 semaine. Sans engagement, sans carte bancaire, sans email gate.
          </p>
          <a href="#audit" className="btn-primary mid-cta-btn">Demander l'audit gratuit →</a>
        </div>
      </div>
    </section>
  );
}

// ─── BACK TO TOP BUTTON ──────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Retour en haut"
    >
      ↑
    </button>
  );
}

// ─── SHARED ──────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      {children}
      <span className="eyebrow-line" aria-hidden />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  GLOBAL CSS (injected via <style> to scope to this page only)
// ═══════════════════════════════════════════════════════════════
const globalStyles = `
.atelier-root {
  --bg: #0A0A0A;
  --surface1: #0D0D0D;
  --surface2: #121212;
  --surface3: #141414;
  --surface4: #1A1A1A;
  --surface5: #1E1E1E;
  --surface6: #252525;
  --accent: #8B9DAF;
  --accent-dark: #4A5D6E;
  --sage: #4A7B5F;
  --sage-bright: #6FA386;
  --text-primary: #FFFFFF;
  --text-secondary: #999999;
  --text-dim: #666666;
  --text-muted: rgba(255,255,255,0.62);

  background: var(--bg);
  color: var(--text-primary);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
  position: relative;
  overflow-x: hidden;
  line-height: 1.5;
}
.atelier-root * { box-sizing: border-box; }

.bg-glow {
  position: absolute; top: -200px; right: -200px;
  width: 800px; height: 800px;
  background: radial-gradient(circle, rgba(139,157,175,0.08), transparent 60%);
  pointer-events: none; z-index: 0;
}
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none; z-index: 0;
}

/* CURSOR GLOW */
.cursor-glow {
  position: fixed; width: 400px; height: 400px;
  border-radius: 50%; pointer-events: none; z-index: 0;
  background: radial-gradient(circle, rgba(74,123,95,0.06), transparent 60%);
  transform: translate(-50%, -50%);
  transition: left 0.15s ease-out, top 0.15s ease-out;
}

/* NAVBAR */
.nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(10,10,10,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--surface4);
  transition: all 0.2s;
}
.nav-scrolled { background: rgba(10,10,10,0.95); }
.nav-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 20px 32px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 32px;
}
.nav-links { display: flex; gap: 28px; align-items: center; }
.nav-link {
  font-size: 13px; color: var(--text-secondary); text-decoration: none;
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
  transition: color 0.2s;
}
.nav-link:hover { color: var(--text-primary); }
.nav-link-cta {
  font-size: 13px; color: var(--text-primary); text-decoration: none;
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
  padding: 8px 16px; border: 1px solid var(--accent); border-radius: 2px;
  transition: all 0.2s;
}
.nav-link-cta:hover { background: var(--accent); color: var(--bg); }
.nav-burger { display: none; background: none; border: none; cursor: pointer; padding: 8px; flex-direction: column; gap: 5px; }
.burger-line { width: 24px; height: 2px; background: var(--text-primary); transition: all 0.2s; }
.nav-mobile { display: none; padding: 16px 32px; flex-direction: column; gap: 12px; border-top: 1px solid var(--surface4); }
.nav-mobile-link { font-size: 14px; color: var(--text-secondary); text-decoration: none; font-family: 'JetBrains Mono', monospace; padding: 8px 0; }
.nav-mobile-cta { font-size: 14px; color: var(--text-primary); text-decoration: none; font-family: 'JetBrains Mono', monospace; padding: 10px 16px; border: 1px solid var(--accent); border-radius: 2px; text-align: center; }

/* HERO */
.hero {
  position: relative; z-index: 1;
  max-width: 1280px; margin: 0 auto;
  padding: 100px 32px 80px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
  align-items: center;
}
.hero-content { max-width: 600px; }
.eyebrow {
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase;
  margin-bottom: 28px; display: flex; align-items: center; gap: 12px;
}
.eyebrow-line { width: 60px; height: 1px; background: linear-gradient(to right, var(--accent-dark), transparent); }
.hero-h1 {
  font-size: clamp(36px, 5vw, 64px); font-weight: 700;
  letter-spacing: -0.04em; line-height: 1.05; color: var(--text-primary);
  margin: 0 0 24px;
}
.hero-h1-accent { color: var(--accent); }
.hero-subhead {
  font-size: 18px; color: var(--text-muted); font-weight: 400;
  line-height: 1.55; margin: 0 0 32px; max-width: 520px;
}
.hero-cta-row { display: flex; gap: 16px; flex-wrap: wrap; }
.btn-primary {
  display: inline-block; padding: 14px 28px;
  background: var(--sage); color: var(--bg);
  font-size: 15px; font-weight: 600; text-decoration: none;
  border-radius: 2px; border: none; cursor: pointer;
  font-family: 'Inter', sans-serif; letter-spacing: 0.01em;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative; overflow: hidden;
}
.btn-primary:hover { background: var(--sage-bright); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(74,123,95,0.3); }
.btn-primary:active { transform: translateY(0); box-shadow: 0 1px 4px rgba(74,123,95,0.2); }
.btn-primary:focus-visible { outline: 2px solid var(--sage-bright); outline-offset: 2px; }
.btn-secondary {
  display: inline-block; padding: 14px 28px;
  background: transparent; color: var(--text-primary);
  font-size: 15px; font-weight: 500; text-decoration: none;
  border-radius: 2px; border: 1px solid var(--surface5); cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-secondary:hover { border-color: var(--accent); background: rgba(139,157,175,0.05); }
.btn-secondary:active { transform: translateY(1px); }
.btn-secondary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* DASHBOARD MOCKUP */
.dashboard-mockup {
  position: relative;
  filter: drop-shadow(0 20px 60px rgba(0,0,0,0.5));
}
.dashboard-glow {
  position: absolute; top: -40px; left: -40px; right: -40px; bottom: -40px;
  background: radial-gradient(ellipse, rgba(74,123,95,0.15), transparent 60%);
  pointer-events: none; z-index: -1;
}
.dashboard-window {
  background: var(--surface2);
  border: 1px solid var(--surface5);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}
.dashboard-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: var(--surface3);
  border-bottom: 1px solid var(--surface5);
  font-size: 11px; font-family: 'JetBrains Mono', monospace;
  color: var(--text-dim);
}
.dashboard-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-red { background: #A0524B; }
.dot-yellow { background: #8B7355; }
.dot-green { background: var(--sage); }
.dashboard-url { color: var(--text-dim); }
.dashboard-status { display: flex; align-items: center; gap: 6px; color: var(--sage); }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

.dashboard-body { display: grid; grid-template-columns: 180px 1fr; min-height: 380px; }
.dashboard-sidebar {
  background: var(--surface1); border-right: 1px solid var(--surface5);
  padding: 16px 12px; font-size: 12px;
}
.sidebar-section { margin-bottom: 20px; }
.sidebar-label {
  font-size: 9px; font-family: 'JetBrains Mono', monospace;
  color: var(--text-dim); letter-spacing: 0.12em; text-transform: uppercase;
  margin-bottom: 8px; padding: 0 8px;
}
.sidebar-item {
  padding: 6px 8px; color: var(--text-muted); font-size: 12px;
  border-radius: 2px; margin-bottom: 2px; cursor: pointer;
}
.sidebar-item-active { background: var(--surface4); color: var(--text-primary); }
.sidebar-engine {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px; color: var(--text-muted); font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
}
.engine-dot { width: 6px; height: 6px; border-radius: 50%; }

.dashboard-main { padding: 20px; }
.dashboard-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px;
}
.dashboard-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.dashboard-subtitle { font-size: 11px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
.dashboard-period { display: flex; gap: 4px; }
.period, .period-active {
  font-size: 10px; font-family: 'JetBrains Mono', monospace;
  padding: 4px 8px; border-radius: 2px; cursor: pointer;
}
.period { color: var(--text-dim); }
.period-active { background: var(--surface4); color: var(--accent); }

.kpi-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 10px; margin-bottom: 16px;
}
.kpi-card {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 12px;
}
.kpi-label { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
.kpi-value-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px; }
.kpi-value { font-size: 22px; font-weight: 700; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; letter-spacing: -0.02em; }
.kpi-delta { font-size: 10px; font-family: 'JetBrains Mono', monospace; }
.kpi-delta-up { color: var(--sage); }
.kpi-delta-down { color: var(--accent); }

.dashboard-chart {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 12px;
}
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.chart-title { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
.chart-legend { display: flex; gap: 12px; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); }
.legend-dot { width: 8px; height: 2px; }
.line-chart { width: 100%; height: 120px; display: block; }

/* LOGO WALL */
.logo-wall {
  position: relative; z-index: 1;
  max-width: 1280px; margin: 0 auto;
  padding: 40px 32px;
  border-top: 1px solid var(--surface4);
  border-bottom: 1px solid var(--surface4);
}
.logo-wall-label {
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase;
  text-align: center; margin-bottom: 24px;
}
.logo-wall-grid {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 32px 48px;
}
.logo-item {
  font-size: 16px; font-weight: 600; color: var(--text-secondary);
  font-family: 'Inter', sans-serif; letter-spacing: -0.01em;
  opacity: 0.7; transition: opacity 0.2s;
}
.logo-item:hover { opacity: 1; color: var(--text-primary); }

/* MARKET STAT */
.market-stat {
  position: relative; z-index: 1;
  max-width: 1280px; margin: 0 auto;
  padding: 100px 32px; text-align: center;
}
.market-stat-num {
  font-size: clamp(64px, 10vw, 120px); font-weight: 800;
  letter-spacing: -0.06em; line-height: 1;
  background: linear-gradient(135deg, var(--sage), var(--accent));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}
.market-stat-label {
  font-size: 20px; color: var(--text-primary); font-weight: 500;
  margin-bottom: 12px;
}
.market-stat-sub {
  font-size: 16px; color: var(--text-muted); max-width: 640px; margin: 0 auto;
}

/* SECTIONS */
.section {
  position: relative; z-index: 1;
  max-width: 1280px; margin: 0 auto;
  padding: 100px 32px;
  border-top: 1px solid var(--surface4);
}
.h2 {
  font-size: clamp(32px, 5vw, 56px); font-weight: 700;
  letter-spacing: -0.04em; line-height: 1.05;
  color: var(--text-primary); margin: 0 0 24px; max-width: 1000px;
}
.section-subhead {
  font-size: 19px; color: var(--text-muted); font-weight: 400;
  line-height: 1.55; max-width: 720px; margin: 0 0 64px;
}

/* FEATURE GRID */
.feature-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.feature-card {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 28px;
  position: relative; overflow: hidden;
  transition: border-color 0.2s;
}
.feature-card:hover { border-color: var(--accent-dark); }
.feature-top-line {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(to right, transparent, var(--accent), transparent);
  opacity: 0.4;
}
.feature-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.feature-icon { font-size: 28px; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
.feature-metric { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--sage); padding: 4px 8px; border: 1px solid var(--sage); border-radius: 2px; opacity: 0.7; }
.feature-title { font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; letter-spacing: -0.02em; }
.feature-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; font-weight: 300; }

/* PROCESS FLOW */
.process-flow {
  display: flex; align-items: stretch; gap: 0;
  overflow-x: auto;
}
.process-step-wrapper {
  display: flex; align-items: stretch; flex: 1; min-width: 200px;
}
.process-step {
  flex: 1; background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 28px; position: relative;
  display: flex; flex-direction: column;
  transition: border-color 0.2s;
}
.process-step:hover { border-color: var(--accent-dark); }
.process-connector {
  display: flex; align-items: center; justify-content: center;
  width: 40px; flex-shrink: 0; position: relative;
}
.process-connector-line {
  width: 100%; height: 1px;
  background: linear-gradient(to right, var(--surface5), var(--accent-dark), var(--surface5));
}
.process-connector-arrow {
  position: absolute; color: var(--accent); font-size: 16px;
  background: var(--bg); padding: 0 4px;
}
.process-num {
  font-size: 11px; font-family: 'JetBrains Mono', monospace;
  color: var(--accent); letter-spacing: 0.12em; margin-bottom: 16px;
}
.process-name { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; letter-spacing: -0.02em; }
.process-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; font-weight: 300; }
.process-deliverable { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--sage); padding-top: 16px; border-top: 1px solid var(--surface5); }
.process-arrow { display: none; }

/* COMPARISON LANDSCAPE */
.landscape-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}
.landscape-col {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 32px 28px; text-align: center;
}
.landscape-col-dim { opacity: 0.6; }
.landscape-col-featured {
  background: var(--surface4); border-color: var(--sage);
  transform: scale(1.02);
}
.landscape-header { font-size: 16px; font-weight: 600; color: var(--text-secondary); margin-bottom: 16px; }
.landscape-header-featured { color: var(--text-primary); }
.landscape-status {
  display: inline-block; padding: 4px 12px; border-radius: 100px;
  font-size: 11px; font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 24px;
}
.landscape-status-gap { background: var(--surface6); color: var(--text-dim); }
.landscape-status-complete { background: var(--sage); color: var(--bg); }
.landscape-list { list-style: none; padding: 0; margin: 0; text-align: left; }
.landscape-item { font-size: 13px; padding: 8px 0; border-bottom: 1px solid var(--surface5); }
.landscape-item-missing { color: var(--text-dim); }
.landscape-item-present { color: var(--text-primary); }

/* BENCHMARK TABLE */
.benchmark-card {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; overflow: hidden; margin-bottom: 48px;
}
.benchmark-table { width: 100%; border-collapse: collapse; }
.benchmark-th {
  padding: 16px 20px; text-align: left;
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  color: var(--text-dim); letter-spacing: 0.08em; text-transform: uppercase;
  border-bottom: 1px solid var(--surface5); background: var(--surface2);
}
.benchmark-th-harch { color: var(--sage); }
.benchmark-th-delta { color: var(--accent); }
.benchmark-td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid var(--surface5); }
.benchmark-td-metric { color: var(--text-primary); font-weight: 500; }
.benchmark-td-harch { color: var(--sage); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
.benchmark-td-industry { color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
.benchmark-td-delta { color: var(--sage); font-family: 'JetBrains Mono', monospace; }

/* CASE STUDIES */
.case-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 20px;
}
.case-card {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 32px 28px;
  position: relative; overflow: hidden;
}
.case-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.case-name { font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px; }
.case-sector { font-size: 12px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
.case-timeline { font-size: 12px; color: var(--accent); font-family: 'JetBrains Mono', monospace; padding: 4px 10px; border: 1px solid var(--accent-dark); border-radius: 2px; }
.case-row { margin-bottom: 16px; display: flex; gap: 12px; align-items: baseline; }
.case-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); letter-spacing: 0.08em; text-transform: uppercase; min-width: 50px; flex-shrink: 0; }
.case-value-before { font-size: 14px; color: var(--text-dim); }
.case-value-after { font-size: 14px; color: var(--sage); font-weight: 500; }
.case-quote { margin: 24px 0 0; padding-top: 20px; border-top: 1px solid var(--surface5); font-size: 15px; color: var(--text-muted); font-style: italic; line-height: 1.6; }
.case-cite { display: block; margin-top: 12px; font-size: 12px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; font-style: normal; }

/* DASHBOARD SHOWCASE */
.audit-mockup { filter: drop-shadow(0 20px 60px rgba(0,0,0,0.5)); }
.audit-window {
  background: var(--surface2); border: 1px solid var(--surface5);
  border-radius: 8px; overflow: hidden;
}
.audit-body { display: grid; grid-template-columns: 220px 1fr; min-height: 480px; }
.audit-sidebar { background: var(--surface1); border-right: 1px solid var(--surface5); padding: 16px 12px; }
.audit-cat {
  padding: 8px 10px; color: var(--text-muted); font-size: 12px;
  border-radius: 2px; margin-bottom: 2px; cursor: pointer;
}
.audit-cat-active { background: var(--surface4); color: var(--text-primary); }
.audit-main { padding: 20px; overflow-x: auto; }
.audit-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 0.8fr;
  gap: 12px; padding: 10px 12px;
  border-bottom: 1px solid var(--surface5); font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
}
.audit-row-header { color: var(--text-dim); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid var(--surface5); }
.audit-col-query { color: var(--text-primary); }
.audit-col-engine { color: var(--sage); text-align: center; }
.audit-col-pos { color: var(--accent); text-align: right; }
.audit-summary {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 12px; margin-top: 20px; padding-top: 20px;
  border-top: 1px solid var(--surface5);
}
.audit-summary-item { background: var(--surface3); border: 1px solid var(--surface5); border-radius: 4px; padding: 12px; }
.audit-summary-label { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
.audit-summary-value { font-size: 18px; font-weight: 700; color: var(--sage); font-family: 'JetBrains Mono', monospace; }

/* PRICING */
.pricing-toggle {
  display: inline-flex; background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 100px; padding: 4px; margin-bottom: 32px;
}
.toggle-btn {
  padding: 10px 20px; background: none; border: none; cursor: pointer;
  font-size: 14px; color: var(--text-secondary); font-family: 'Inter', sans-serif;
  border-radius: 100px; transition: all 0.2s;
}
.toggle-btn-active { background: var(--sage); color: var(--bg); }
.toggle-save { font-size: 11px; padding: 2px 6px; background: var(--sage-bright); color: var(--bg); border-radius: 2px; margin-left: 4px; font-weight: 600; }

.pricing-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px; align-items: stretch;
}
.tier {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 32px 28px;
  display: flex; flex-direction: column; position: relative; overflow: hidden;
}
.tier-featured { background: var(--surface4); border-color: var(--sage); }
.tier-badge {
  position: absolute; top: 16px; right: 16px;
  background: var(--sage); color: var(--bg);
  font-size: 10px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.08em; padding: 4px 10px; border-radius: 2px; text-transform: uppercase;
}
.tier-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
.tier-name { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; letter-spacing: -0.03em; line-height: 1; }
.tier-price { margin-bottom: 8px; line-height: 1; }
.tier-price-free { font-size: 36px; font-weight: 700; color: var(--sage); }
.tier-price-num { font-size: 40px; font-weight: 700; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; letter-spacing: -0.03em; }
.tier-price-currency { font-size: 14px; color: var(--text-dim); font-weight: 500; }
.tier-price-custom { font-size: 28px; font-weight: 700; color: var(--text-primary); }
.tier-period { font-size: 12px; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-bottom: 24px; letter-spacing: 0.04em; }
.tier-list { list-style: none; padding: 0; margin: 0 0 24px; flex: 1; }
.tier-item { font-size: 13px; color: var(--text-muted); padding: 6px 0; display: flex; gap: 8px; align-items: baseline; }
.tier-check { color: var(--sage); flex-shrink: 0; }
.tier-footer { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); padding-top: 16px; border-top: 1px solid var(--surface5); margin-bottom: 20px; }
.tier-cta { display: block; text-align: center; text-decoration: none; }

/* FAQ */
.faq-list { display: flex; flex-direction: column; gap: 12px; max-width: 880px; }
.faq-item { background: var(--surface3); border: 1px solid var(--surface5); border-radius: 4px; overflow: hidden; }
.faq-question {
  width: 100%; padding: 20px 24px; background: none; border: none;
  color: var(--text-primary); font-size: 16px; font-weight: 500;
  text-align: left; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  font-family: 'Inter', sans-serif;
}
.faq-question-text { flex: 1; }
.faq-chevron { color: var(--accent); font-size: 24px; font-weight: 300; transition: transform 0.2s; flex-shrink: 0; }
.faq-answer-wrapper {
  max-height: 0; overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-answer-open { max-height: 500px; }
.faq-answer { padding: 0 24px 24px; font-size: 15px; color: var(--text-muted); line-height: 1.65; font-weight: 300; }

/* CTA */
.section-cta { padding-bottom: 80px; }
.cta-card {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 48px;
  position: relative; overflow: hidden; max-width: 780px;
}
.form { display: flex; flex-direction: column; gap: 24px; }
.form-row-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.form-label { display: flex; flex-direction: column; gap: 8px; }
.form-label-text { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); letter-spacing: 0.12em; text-transform: uppercase; }
.input {
  background: var(--bg); border: 1px solid var(--surface5); border-radius: 2px;
  padding: 12px 16px; color: var(--text-primary); font-size: 15px;
  font-family: 'Inter', sans-serif; outline: none;
}
.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(139,157,175,0.1); }
.input:focus-visible { outline: none; }
.input::placeholder { color: var(--text-faint); }
.trust-signals { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.trust-item { font-size: 13px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
.success-msg { padding: 24px 0; }
.success-title { font-size: 24px; font-weight: 700; color: var(--sage); margin-bottom: 12px; }
.success-body { font-size: 15px; color: var(--text-muted); line-height: 1.6; }
.link-inline { color: var(--accent); text-decoration: none; }

/* FOOTER */
.footer {
  position: relative; z-index: 1;
  border-top: 1px solid var(--surface4); background: var(--surface2);
  padding: 64px 32px 32px;
}
.footer-top {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr auto; gap: 48px;
  margin-bottom: 48px; align-items: start;
}
.footer-brand-block { display: flex; flex-direction: column; gap: 8px; }
.footer-tagline { margin-top: 8px; font-size: 14px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; }
.footer-contact { display: flex; gap: 8px; align-items: center; margin-top: 12px; font-size: 13px; }
.footer-dim { color: var(--text-dim); }
.footer-parent { margin-top: 4px; font-size: 13px; color: var(--accent) !important; }
.footer-cols { display: flex; gap: 48px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.footer-col-title { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
.footer-link { font-size: 13px; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
.footer-link:hover { color: var(--text-primary); }
.footer-countries {
  max-width: 1280px; margin: 0 auto;
  padding: 40px 0; border-top: 1px solid var(--surface4);
  margin-top: 40px;
}
.countries-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px; margin-top: 16px;
}
.country-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; background: var(--surface3);
  border: 1px solid var(--surface5); border-radius: 4px;
}
.country-code {
  font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
  color: var(--sage); padding: 4px 8px;
  background: rgba(74,123,95,0.1); border: 1px solid var(--sage);
  border-radius: 2px; letter-spacing: 0.08em;
}
.country-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.country-cities { font-size: 11px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
.footer-bottom {
  max-width: 1280px; margin: 0 auto; padding-top: 32px;
  border-top: 1px solid var(--surface4);
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
}
.footer-legal { font-size: 12px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; }

/* SCROLL PROGRESS BAR */
.scroll-progress {
  position: fixed; top: 0; left: 0; height: 2px;
  background: linear-gradient(to right, var(--sage), var(--accent));
  z-index: 100; transition: width 0.1s ease-out;
  box-shadow: 0 0 8px rgba(74,123,95,0.5);
}

/* STATS COUNTER */
.stats-counter-section { padding: 80px 32px; }
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}
.stat-item {
  text-align: left; padding: 24px 0;
  border-left: 2px solid var(--surface5); padding-left: 24px;
}
.stat-num {
  font-size: clamp(40px, 6vw, 64px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary); margin-bottom: 12px;
}
.stat-suffix { color: var(--sage); font-size: 0.6em; }
.stat-label {
  font-size: 15px; font-weight: 600; color: var(--text-primary);
  margin-bottom: 4px;
}
.stat-sub {
  font-size: 12px; color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em;
}

/* USE CASES */
.usecase-layout {
  display: grid; grid-template-columns: 240px 1fr; gap: 24px;
}
.usecase-tabs {
  display: flex; flex-direction: column; gap: 4px;
}
.usecase-tab {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: none; border: 1px solid transparent;
  border-radius: 4px; cursor: pointer; text-align: left;
  color: var(--text-muted); font-family: 'Inter', sans-serif;
  font-size: 14px; font-weight: 500;
  transition: all 0.2s;
}
.usecase-tab:hover { background: var(--surface3); color: var(--text-primary); }
.usecase-tab-active {
  background: var(--surface4); border-color: var(--surface5);
  color: var(--text-primary);
}
.usecase-tab-icon { font-size: 20px; flex-shrink: 0; }
.usecase-tab-name { flex: 1; }

.usecase-content {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 32px; position: relative; overflow: hidden;
  min-height: 320px;
  animation: tabFadeIn 0.3s ease-out;
}
@keyframes tabFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.usecase-header {
  display: flex; align-items: flex-start; gap: 20px; margin-bottom: 24px;
}
.usecase-icon-big {
  font-size: 48px; line-height: 1; flex-shrink: 0;
  width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;
  background: var(--surface4); border: 1px solid var(--surface5); border-radius: 8px;
}
.usecase-title {
  font-size: 24px; font-weight: 700; color: var(--text-primary);
  letter-spacing: -0.02em; margin-bottom: 8px;
}
.usecase-query {
  font-size: 14px; color: var(--accent);
  font-family: 'JetBrains Mono', monospace; font-style: italic;
}
.usecase-desc {
  font-size: 15px; color: var(--text-muted); line-height: 1.65;
  margin-bottom: 24px; font-weight: 300;
}
.usecase-kpis {
  display: flex; flex-wrap: wrap; gap: 12px;
  padding-top: 20px; border-top: 1px solid var(--surface5);
}
.usecase-kpi {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; background: var(--surface4);
  border: 1px solid var(--surface5); border-radius: 100px;
  font-size: 13px; color: var(--text-primary); font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
}
.usecase-kpi-check { color: var(--sage); }

/* TESTIMONIALS */
.testimonials-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}
.testimonial-card {
  background: var(--surface3); border: 1px solid var(--surface5);
  border-radius: 4px; padding: 32px 28px;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
}
.testimonial-metric {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 24px; padding-bottom: 20px;
  border-bottom: 1px solid var(--surface5);
}
.testimonial-metric-value {
  font-size: 22px; font-weight: 700; color: var(--sage);
  font-family: 'JetBrains Mono', monospace; letter-spacing: -0.02em;
}
.testimonial-metric-timeline {
  font-size: 12px; color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  padding: 4px 10px; border: 1px solid var(--accent-dark); border-radius: 2px;
}
.testimonial-quote {
  font-size: 16px; color: var(--text-primary); line-height: 1.65;
  font-style: italic; margin: 0 0 24px; flex: 1;
}
.testimonial-author {
  display: flex; align-items: center; gap: 12px;
  padding-top: 20px; border-top: 1px solid var(--surface5);
}
.testimonial-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--surface5); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}
.testimonial-name {
  font-size: 14px; font-weight: 600; color: var(--text-primary);
}
.testimonial-company {
  font-size: 12px; color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
}

/* MID CTA */
.mid-cta-section {
  position: relative; z-index: 1;
  max-width: 1280px; margin: 0 auto;
  padding: 60px 32px;
}
.mid-cta-card {
  background: linear-gradient(135deg, var(--surface3), var(--surface2));
  border: 1px solid var(--surface5);
  border-radius: 8px; padding: 64px 48px;
  position: relative; overflow: hidden; text-align: center;
}
.mid-cta-glow {
  position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 300px;
  background: radial-gradient(ellipse, rgba(74,123,95,0.15), transparent 60%);
  pointer-events: none;
}
.mid-cta-content { position: relative; z-index: 1; }
.mid-cta-eyebrow {
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  color: var(--sage); letter-spacing: 0.14em; text-transform: uppercase;
  margin-bottom: 20px;
}
.mid-cta-title {
  font-size: clamp(28px, 4vw, 44px); font-weight: 700;
  letter-spacing: -0.03em; line-height: 1.15;
  color: var(--text-primary); margin-bottom: 20px;
}
.mid-cta-title-accent { color: var(--sage); }
.mid-cta-sub {
  font-size: 17px; color: var(--text-muted); line-height: 1.6;
  max-width: 640px; margin: 0 auto 32px;
}
.mid-cta-btn { font-size: 16px; padding: 16px 32px; }

/* INTEGRATIONS */
.integrations-section { padding: 60px 32px; border-top: 1px solid var(--surface4); }
.integrations-inner { max-width: 1280px; margin: 0 auto; }
.integrations-label {
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase;
  text-align: center; margin-bottom: 24px;
}
.integrations-grid {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 16px 32px;
}
.integration-item {
  display: flex; flex-direction: column; gap: 2px;
  padding: 12px 20px; background: var(--surface3);
  border: 1px solid var(--surface5); border-radius: 4px;
  transition: border-color 0.2s;
}
.integration-item:hover { border-color: var(--accent-dark); }
.integration-name {
  font-size: 14px; font-weight: 600; color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}
.integration-desc {
  font-size: 11px; color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
}

/* BACK TO TOP */
.back-to-top {
  position: fixed; bottom: 32px; right: 32px;
  width: 44px; height: 44px;
  background: var(--surface4); border: 1px solid var(--surface5);
  border-radius: 4px; color: var(--text-primary);
  font-size: 20px; cursor: pointer; z-index: 40;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeInUp 0.3s ease-out;
}
.back-to-top:hover { background: var(--surface5); border-color: var(--accent); transform: translateY(-2px); }
.back-to-top:active { transform: translateY(0); }
.back-to-top:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ANIMATIONS */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
.atelier-root .hero-content { animation: fadeInUp 0.8s ease-out; }
.atelier-root .dashboard-mockup { animation: slideInRight 1s ease-out 0.2s both; }
.atelier-root .logo-wall { animation: fadeIn 1s ease-out 0.4s both; }
.atelier-root .market-stat { animation: fadeInUp 0.8s ease-out; }
.atelier-root .kpi-card { transition: transform 0.2s, border-color 0.2s; }
.atelier-root .kpi-card:hover { transform: translateY(-2px); border-color: var(--accent-dark); }
.atelier-root .feature-card { transition: transform 0.2s, border-color 0.2s; }
.atelier-root .feature-card:hover { transform: translateY(-2px); }
.atelier-root .tier { transition: transform 0.2s, border-color 0.2s; }
.atelier-root .tier:hover { transform: translateY(-2px); }
.atelier-root .tier-featured:hover { border-color: var(--sage-bright); }
.atelier-root .case-card { transition: border-color 0.2s; }
.atelier-root .case-card:hover { border-color: var(--accent-dark); }

/* Pricing toggle smooth */
.atelier-root .toggle-btn { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

/* Nav link underline + focus states */
.atelier-root .nav-link { position: relative; }
.atelier-root .nav-link::after {
  content: ''; position: absolute; bottom: -4px; left: 0;
  width: 0; height: 1px; background: var(--accent);
  transition: width 0.2s;
}
.atelier-root .nav-link:hover::after { width: 100%; }
.atelier-root .nav-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 2px; }
.atelier-root .nav-link-cta:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.atelier-root .faq-question:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.atelier-root .usecase-tab:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.atelier-root .toggle-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.atelier-root .footer-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
.atelier-root a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }

/* Scroll-triggered section reveal */
.atelier-root .section { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
.atelier-root .section.section-visible { opacity: 1; transform: translateY(0); }

/* Dashboard mockup floating animation */
.atelier-root .dashboard-mockup {
  animation: slideInRight 1s ease-out 0.2s both, floatSubtle 6s ease-in-out 2s infinite;
}
@keyframes floatSubtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Audit row hover */
.atelier-root .audit-row:not(.audit-row-header) {
  cursor: pointer;
  transition: background 0.15s;
}
.atelier-root .audit-row:not(.audit-row-header):hover {
  background: var(--surface4);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; padding: 60px 24px 40px; }
  .nav-links { display: none; }
  .nav-burger { display: flex; }
  .nav-mobile { display: flex; }
  .dashboard-body { grid-template-columns: 1fr; }
  .dashboard-sidebar { display: none; }
  .audit-body { grid-template-columns: 1fr; }
  .audit-sidebar { display: none; }
  .footer-top { grid-template-columns: 1fr; }
  .footer-cols { gap: 32px; }
  .section { padding: 60px 24px; }
  .audit-row { grid-template-columns: 1.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.6fr; font-size: 11px; padding: 8px; gap: 6px; }
  .audit-summary { grid-template-columns: repeat(2, 1fr); }
  .process-flow { flex-direction: column; gap: 16px; }
  .process-connector { display: none; }
  .usecase-tabs { flex-direction: row; overflow-x: auto; gap: 8px; }
  .usecase-tab { white-space: nowrap; min-width: max-content; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .mid-cta-card { padding: 40px 24px; }
  .landscape-grid { grid-template-columns: 1fr; }
  .landscape-col-featured { transform: none; }
}
@media (max-width: 600px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .audit-row { font-size: 10px; }
  .hero-h1 { font-size: 32px; }
  .h2 { font-size: 28px; }
  .stats-grid { grid-template-columns: 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .pricing-grid { grid-template-columns: 1fr; }
  .feature-grid { grid-template-columns: 1fr; }
  .footer-cols { flex-direction: column; gap: 24px; }
  .footer-bottom { flex-direction: column; text-align: center; }
}
`;
