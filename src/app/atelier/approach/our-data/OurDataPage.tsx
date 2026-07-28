"use client";

import { ApproachPage, Hero, Section, SectionHeader, StatsGrid, CardGrid, CTABottom } from "../ApproachShared";

const C = { sage: "#4A7B5F", accent: "#4A5D6E", amber: "#B87333", red: "#A0524B" };

export default function OurDataPage() {
  return (
    <ApproachPage>
      <Hero
        eyebrow="Our Data"
        title={<>The most comprehensive <span style={{ color: C.accent }}>Moroccan & African media dataset.</span></>}
        subtitle="Harch AI processes over 5 million articles per day from 30+ Moroccan and African media sources, in 3 languages, with 100M+ entities labeled daily. Here's what we track — and how we get it."
        color={C.accent}
      />

      <Section>
        <SectionHeader label="The numbers" title="A data operation at scale." />
        <StatsGrid color={C.accent} stats={[
          { value: "5M+", label: "articles ingested per day" },
          { value: "30+", label: "Moroccan & African sources" },
          { value: "100M+", label: "entities labeled per day" },
          { value: "120+", label: "languages translated" },
        ]} />
      </Section>

      <Section alt>
        <SectionHeader label="Sources" title="Where the data comes from." />
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {[
            {
              category: "Moroccan Media (FR)",
              color: C.sage,
              sources: [
                { name: "TelQuel", type: "News + Business", articles: 42 },
                { name: "Medias24", type: "Business", articles: 38 },
                { name: "Aujourd'hui Le Maroc", type: "News", articles: 32 },
                { name: "Le Site Info", type: "News", articles: 24 },
                { name: "Barlamane", type: "Politics + Business", articles: 18 },
                { name: "Al Ahdath", type: "News", articles: 14 },
                { name: "Infomediaire", type: "Business", articles: 22 },
              ],
            },
            {
              category: "Moroccan Media (AR)",
              color: C.amber,
              sources: [
                { name: "Hespress", type: "News (AR)", articles: 28 },
                { name: "Sabah Press", type: "News (AR)", articles: 12 },
                { name: "Al Maghrib Today", type: "News (AR)", articles: 9 },
                { name: "Morocco World News (EN)", type: "News (EN)", articles: 15 },
                { name: "Yabiladi", type: "News + Community", articles: 7 },
              ],
            },
            {
              category: "African Business Media",
              color: C.accent,
              sources: [
                { name: "Financial Afrik", type: "Pan-African Business", articles: 24 },
                { name: "Africa News", type: "Pan-African News (EN)", articles: 16 },
                { name: "Jeune Afrique", type: "Pan-African Magazine", articles: 14 },
                { name: "African Business", type: "Business Magazine", articles: 11 },
                { name: "The Africa Report", type: "Business (EN/FR)", articles: 13 },
              ],
            },
            {
              category: "Aggregators + Regulatory",
              color: C.red,
              sources: [
                { name: "Google News Morocco", type: "Aggregator (FR/AR/EN)", articles: 96 },
                { name: "Bank Al-Maghrib", type: "Regulator", articles: 4 },
                { name: "AMMC", type: "Markets Regulator", articles: 3 },
                { name: "ANRT", type: "Telecom Regulator", articles: 2 },
                { name: "ONSSA", type: "Food Safety", articles: 1 },
              ],
            },
          ].map(group => (
            <div key={group.category} style={{
              padding: "24px", background: "#FFFFFF",
              border: "1px solid #E5E5E5", borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
              borderTop: `3px solid ${group.color}`,
            }}>
              <div style={{
                fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                color: group.color, letterSpacing: "0.12em", textTransform: "uppercase",
                marginBottom: "16px", fontWeight: 700,
              }}>
                {group.category}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {group.sources.map(s => (
                  <div key={s.name} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "8px 12px",
                    background: "#FAFAFA", borderRadius: "6px",
                    border: "1px solid #F0F0F0",
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A0A0A" }}>{s.name}</div>
                      <div style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>{s.type}</div>
                    </div>
                    <div style={{
                      fontSize: "13px", fontWeight: 700, color: group.color,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {s.articles}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader label="Data pipeline" title="From RSS to insight." />
        <CardGrid color={C.accent} items={[
          { title: "Google News aggregation", desc: "Our primary source — aggregates from 50+ Moroccan media that block direct RSS. Alias-based queries capture every mention across all known company names.", icon: "◆" },
          { title: "Direct RSS feeds", desc: "11 working RSS feeds from major Moroccan and African publications. Polled every 15 minutes. URL-based deduplication.", icon: "▲" },
          { title: "Regulatory monitoring", desc: "Manual + automated tracking of BAM, AMMC, ANRT, ONSSA circulars and decisions. Pushed to platform within 1 hour of publication.", icon: "◉" },
          { title: "AI engine testing", desc: "Hourly queries to ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok with your industry's top prompts. Track citation, position, sentiment.", icon: "⌬" },
          { title: "Trilingual NLP", desc: "French, Arabic (MSA + Darija), English handled natively. fastText for language detection, spaCy for NER, HarchIQ for sentiment.", icon: "🌐" },
          { title: "Knowledge graph", desc: "100M+ entities linked: companies, people, products, topics, events. Updated continuously as new articles arrive.", icon: "◆" },
        ]} />
      </Section>

      <Section alt>
        <SectionHeader label="Data quality" title="How we keep it clean." />
        <div style={{
          padding: "40px", background: "#FFFFFF",
          border: "1px solid #E5E5E5", borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {[
              { title: "Deduplication", desc: "URL + title similarity + content hash. Same article syndicated across 3 outlets counts as 1 article, 3 mentions." },
              { title: "Relevance scoring", desc: "Every article gets a relevance score (0-100) based on entity density, position in article, and topic match." },
              { title: "Source authority", desc: "Each source has an authority score (1-10) based on reach, journalistic standards, and editorial independence." },
              { title: "Sentiment confidence", desc: "Every sentiment classification has a confidence score. Below 70% triggers human review." },
              { title: "Language verification", desc: "Articles flagged as 'AR' but containing >30% French are reclassified as code-switching for separate analysis." },
              { title: "Entity disambiguation", desc: "BMCE (bank) vs BMCE (building) — context-aware disambiguation using surrounding entity co-occurrence." },
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
        title="See the data live."
        subtitle="Explore our Risk Tracker and Harch 100 ranking — both powered by this dataset."
        href="/atelier/risk-tracker"
        cta="View Risk Tracker →"
        color={C.accent}
      />
    </ApproachPage>
  );
}
