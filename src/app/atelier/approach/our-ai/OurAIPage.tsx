"use client";

import { ApproachPage, Hero, Section, SectionHeader, StatsGrid, CardGrid, CTABottom } from "../ApproachShared";

const C = { sage: "#4A7B5F", accent: "#4A5D6E", amber: "#B87333", red: "#A0524B" };

export default function OurAIPage() {
  return (
    <ApproachPage>
      <Hero
        eyebrow="Our AI · Meet HarchIQ"
        title={<>The trainable AI for <span style={{ color: C.sage }}>reputation intelligence.</span></>}
        subtitle="HarchIQ is the scalable, trainable intelligence at the heart of Harch Atelier. It reads 5M+ documents a day, identifies concepts from concrete entities to notional topics, and links that information to its underlying knowledge graph — surfacing critical intelligence in real-time."
        color={C.sage}
      />

      <Section>
        <SectionHeader label="What HarchIQ does" title="Three capabilities. One brain." />
        <CardGrid color={C.sage} items={[
          { title: "Reads everything", desc: "5M+ news, blog, broadcast & regulatory documents per day. 30+ Moroccan & African media sources. 120+ languages translated. Real-time ingestion with 15-minute refresh.", icon: "◆" },
          { title: "Understands context", desc: "Trained on your industry, competitors, and priorities. Entity-level understanding (companies, people, products, topics). Trilingual sentiment: French, Arabic, English.", icon: "▲" },
          { title: "Surfaces what matters", desc: "Predictive alerts before crises erupt. Emerging narrative detection. AI-generated recommendations per risk. WhatsApp + email + dashboard delivery.", icon: "◉" },
        ]} />
      </Section>

      <Section alt>
        <SectionHeader label="The pipeline" title="From article to insight in 9 steps." />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "900px" }}>
          {[
            { n: "01", title: "Ingest", desc: "RSS feeds from 30+ sources scraped every 15 minutes. Google News Morocco as primary aggregator." },
            { n: "02", title: "Detect language", desc: "fastText identifies FR/AR/EN. Darija and code-switching flagged for review." },
            { n: "03", title: "Extract entities", desc: "spaCy NER with custom Moroccan entity library (banks, telcos, government bodies, executives)." },
            { n: "04", title: "Classify sentiment", desc: "HarchIQ assigns a score from -1 (negative) to +1 (positive) with confidence interval. Trilingual lexicon of 108+ words per language." },
            { n: "05", title: "Cluster topics", desc: "10 topic categories: financial results, leadership, products, ESG, M&A, digital, crisis, expansion, partnerships, regulation." },
            { n: "06", title: "Detect narratives", desc: "Identify the 5 dominant narratives forming around each company, with strength, sentiment, and trajectory." },
            { n: "07", title: "Assess risk", desc: "32 risk event categories scored on Frequency × Impact × Velocity. Industry-specific weighting applied." },
            { n: "08", title: "Calculate reputation score", desc: "Composite 0-100 score: sentiment (40%) + AI visibility (30%) + volume (20%) + authority (10%)." },
            { n: "09", title: "Generate recommendations", desc: "HarchIQ produces prioritized, actionable recommendations with timeline and owner." },
          ].map(step => (
            <div key={step.n} style={{
              display: "grid", gridTemplateColumns: "60px 200px 1fr",
              gap: "20px", padding: "20px 24px",
              background: "#FAFAFA", border: "1px solid #E5E5E5",
              borderRadius: "10px", alignItems: "center",
            }}>
              <span style={{
                fontSize: "24px", fontWeight: 800, color: C.sage,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {step.n}
              </span>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0A0A0A" }}>
                {step.title}
              </div>
              <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.55 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader label="HarchIQ in production" title="The numbers behind the brain." />
        <StatsGrid color={C.sage} stats={[
          { value: "5M+", label: "documents read per day" },
          { value: "108+", label: "sentiment words per language" },
          { value: "32", label: "risk categories detected" },
          { value: "9", label: "step analysis pipeline" },
        ]} />
      </Section>

      <Section alt>
        <SectionHeader label="Trainable" title="HarchIQ learns your business." />
        <div style={{
          padding: "40px", background: "#FFFFFF",
          border: "1px solid #E5E5E5", borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.65, marginBottom: "24px", maxWidth: "760px" }}>
            Out of the box, HarchIQ understands Moroccan and African business context. But every customer trains it further:
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {[
              { title: "Custom entities", desc: "Add your products, executives, subsidiaries, competitors, and key customers to the entity library." },
              { title: "Custom topics", desc: "Define the topics that matter to your business beyond the default 10 (e.g. 'Talent acquisition', 'Supply chain transparency')." },
              { title: "Custom risk taxonomy", desc: "Add industry-specific risks beyond the default 32 (e.g. 'Fuel price volatility' for aviation)." },
              { title: "Custom sentiment rules", desc: "Define positive/negative phrases specific to your industry (e.g. 'NPL ratio' is negative for banks)." },
              { title: "Stakeholder mapping", desc: "Tell HarchIQ who matters: key journalists, analysts, regulators, NGOs, influencers." },
              { title: "Strategic priorities", desc: "Weight topics by your current strategic focus (e.g. 'amplify ESG coverage for FY26')." },
            ].map(item => (
              <div key={item.title} style={{
                padding: "20px", background: "#FAFAFA",
                border: "1px solid #E5E5E5", borderRadius: "10px",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", marginBottom: "8px" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <CTABottom
        title="See HarchIQ in action."
        subtitle="Request a personalized demo and watch HarchIQ analyze your company's reputation in real-time."
        color={C.sage}
      />
    </ApproachPage>
  );
}
