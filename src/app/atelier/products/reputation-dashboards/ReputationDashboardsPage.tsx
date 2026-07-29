"use client";

import { ApproachPage, Hero, Section, SectionHeader, StatsGrid, CardGrid, CTABottom } from "../../approach/ApproachShared";

const C = { sage: "#4A7B5F", accent: "#4A5D6E", amber: "#B87333", red: "#A0524B", sageBright: "#6FA386" };

// ═══════════════════════════════════════════════════════════════
//  REPUTATION DASHBOARDS — Product Page (Signal AI style)
//  AI-powered interactive dashboards for brand health & competitors
// ═══════════════════════════════════════════════════════════════

export default function ReputationDashboardsPage() {
  return (
    <ApproachPage>
      <Hero
        eyebrow="Product · Reputation Dashboards"
        title={<>Reputation intelligence <span style={{ color: C.sage }}>tailored to your needs.</span></>}
        subtitle="Monitoring and evaluating brand performance is a time-consuming and manual process, especially for strategic communications teams using custom reputation pillars. With Harch Atelier Reputation Dashboards, access AI-powered interactive dashboards for monitoring both your brand's reputation performance and for deeper competitive analysis."
        color={C.sage}
      />

      {/* SCORING METHODOLOGY */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "64px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
              Harch AI Scoring Methodology
            </div>
            <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 24px" }}>
              Quantifying reputation performance.
            </h2>
            <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.65, marginBottom: "24px", maxWidth: "560px" }}>
              Create a winning reputation strategy without the heavy lifting. Harch AI's proprietary scoring methodology provides an objective quantification of your performance and comparison between organizations. Our weighted reputation score uses a combination of factors including volume, sentiment, salience, and source significance, to provide you with numerical and nuanced insights.
            </p>
            <div style={{ padding: "24px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sage, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>
                Reputation Score Formula
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px", letterSpacing: "-0.02em" }}>
                Volume × 25% + Sentiment × 40% + Salience × 20% + Source Significance × 15%
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "12px" }}>
                {[
                  { label: "Volume", weight: "25%", desc: "Coverage count" },
                  { label: "Sentiment", weight: "40%", desc: "Positive/negative ratio" },
                  { label: "Salience", weight: "20%", desc: "Topic relevance" },
                  { label: "Source Sig.", weight: "15%", desc: "Outlet authority" },
                ].map(s => (
                  <div key={s.label} style={{ padding: "12px", background: "#FAFAFA", borderRadius: "8px", border: "1px solid #F0F0F0" }}>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: C.sage, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "4px" }}>{s.weight}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#0A0A0A", marginBottom: "2px" }}>{s.label}</div>
                    <div style={{ fontSize: "10px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            {/* Visual: sample dashboard mockup */}
            <div style={{ padding: "32px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #F0F0F0" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Reputation Score</div>
                  <div style={{ fontSize: "48px", fontWeight: 800, color: C.sage, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, letterSpacing: "-0.04em" }}>78</div>
                </div>
                <div style={{ padding: "8px 14px", background: "rgba(74,123,95,0.1)", borderRadius: "100px", fontSize: "13px", fontWeight: 700, color: C.sage, fontFamily: "'JetBrains Mono', monospace" }}>
                  ▲ +4.2 pts
                </div>
              </div>
              {/* Pillar bars */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Pillars</div>
                {[
                  { name: "Innovation", score: 82, color: C.sage },
                  { name: "Performance", score: 76, color: C.accent },
                  { name: "Purpose", score: 71, color: C.amber },
                ].map(p => (
                  <div key={p.name} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: "#0A0A0A", fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: "#525252", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{p.score}</span>
                    </div>
                    <div style={{ height: "6px", background: "#F4F4F5", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${p.score}%`, height: "100%", background: p.color, borderRadius: "3px" }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Sentiment split */}
              <div>
                <div style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Sentiment (30 days)</div>
                <div style={{ display: "flex", height: "24px", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ width: "68%", background: C.sage, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>68%</div>
                  <div style={{ width: "22%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>22%</div>
                  <div style={{ width: "10%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "10px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>10%</div>
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "10px", color: "#71717A" }}>
                  <span style={{ color: C.sage }}>● Positive</span>
                  <span style={{ color: C.accent }}>● Neutral</span>
                  <span style={{ color: C.red }}>● Negative</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CAPABILITIES — 7 features */}
      <Section alt>
        <SectionHeader label="Capabilities" title="What you can do with Reputation Dashboards." />
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            { icon: "📊", title: "Monitor your brand health at a glance", desc: "Easily monitor your performance with KPIs including coverage volume, sentiment and scoring over time, across your strategic pillars. Compare these like-for-like with your key competitors." },
            { icon: "🎯", title: "Tailor your benchmarking to the topics you care about", desc: "With this competitor scorecard, benchmark your performance across a range of scores and metrics. Identify topics where they're winning to inform your communications strategy." },
            { icon: "🔍", title: "Move beyond basic metrics with topic scoring", desc: "See how pillars and underlying topics perform relative to each other and to historic benchmarks. Use coverage, volume and sentiment to identify topics which stand out, then drill into the stories driving the trends." },
            { icon: "⚠", title: "Scan the horizon for anomalies", desc: "Detect significant spikes in coverage for your brand outside of your topic framework. Strategically assess anomalies by quantifying and categorizing with key metrics, then dig into the stories, all in one place." },
            { icon: "📅", title: "Assess past events with the highest brand impact", desc: "See key past events that affected you and your competitors, with risk level and impact score. Inspect historical trends against each of your reputation pillars with easy-to-segment filters." },
            { icon: "🏆", title: "Know where you stand with industry rankings", desc: "See where you rank in your industry, against your strategic pillars, and trends of coverage volume and sentiment to inform your PR and Communications strategy." },
            { icon: "💡", title: "Identify risks and opportunities", desc: "Understand your strengths, weaknesses, opportunities and threats, relative to your brand pillars. Compare with your competitors to create a winning reputation strategy." },
          ].map((cap, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "24px", padding: "32px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)", borderLeft: "4px solid " + C.sage, alignItems: "flex-start" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "rgba(74,123,95,0.1)", color: C.sage, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>
                {cap.icon}
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
                  {cap.title}
                </h3>
                <p style={{ fontSize: "15px", color: "#525252", lineHeight: 1.65, margin: 0, maxWidth: "760px" }}>
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* MATERIALITY MATRIX */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "64px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
              Materiality Matrix
            </div>
            <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 24px" }}>
              Mitigate risks with internal vs external comparison.
            </h2>
            <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.65, marginBottom: "24px", maxWidth: "560px" }}>
              See where key topics fall in a comparison between internal value and external impact in a materiality matrix that blends Harch AI metrics with your internal priorities. Spot areas where you're winning and areas which may require a risk mitigation strategy with positive and negative impact hotspots.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Positive impact hotspots", desc: "Topics where external perception exceeds internal priority — leverage opportunity", color: C.sage },
                { label: "Negative impact hotspots", desc: "Topics where external risk exceeds internal mitigation — act now", color: C.red },
                { label: "Aligned zones", desc: "Topics where internal priority matches external impact — maintain strategy", color: C.accent },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: "12px", padding: "16px", background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "8px", borderLeft: `3px solid ${item.color}` }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: "6px" }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {/* Materiality matrix visualization */}
            <div style={{ padding: "32px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#71717A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>
                Materiality Matrix
              </div>
              <svg viewBox="0 0 360 360" style={{ width: "100%", height: "auto" }}>
                {/* Axes */}
                <line x1="40" y1="320" x2="340" y2="320" stroke="#525252" strokeWidth="1.5" />
                <line x1="40" y1="20" x2="40" y2="320" stroke="#525252" strokeWidth="1.5" />
                {/* Grid lines */}
                {[100, 180, 260].map(p => (
                  <g key={p}>
                    <line x1={p} y1="20" x2={p} y2="320" stroke="#F0F0F0" strokeWidth="1" />
                    <line x1="40" y1={p} x2="340" y2={p} stroke="#F0F0F0" strokeWidth="1" />
                  </g>
                ))}
                {/* Axis labels */}
                <text x="190" y="345" fontSize="10" fill="#71717A" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">Internal Priority →</text>
                <text x="15" y="170" fontSize="10" fill="#71717A" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" transform="rotate(-90 15 170)">External Impact →</text>
                {/* Quadrant labels */}
                <text x="280" y="50" fontSize="9" fill={C.sage} fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="700">WIN</text>
                <text x="100" y="50" fontSize="9" fill={C.red} fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="700">RISK</text>
                <text x="280" y="300" fontSize="9" fill={C.accent} fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="700">MAINTAIN</text>
                <text x="100" y="300" fontSize="9" fill="#71717A" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="700">MONITOR</text>
                {/* Bubbles - positive impact (sage) */}
                <circle cx="280" cy="60" r="14" fill={C.sage} opacity="0.7" />
                <circle cx="250" cy="90" r="10" fill={C.sage} opacity="0.7" />
                <circle cx="300" cy="100" r="8" fill={C.sage} opacity="0.7" />
                {/* Bubbles - risk (red) */}
                <circle cx="100" cy="70" r="16" fill={C.red} opacity="0.7" />
                <circle cx="130" cy="100" r="11" fill={C.red} opacity="0.7" />
                {/* Bubbles - aligned (accent) */}
                <circle cx="270" cy="240" r="13" fill={C.accent} opacity="0.7" />
                <circle cx="240" cy="270" r="9" fill={C.accent} opacity="0.7" />
                <circle cx="200" cy="220" r="7" fill={C.accent} opacity="0.7" />
                {/* Bubbles - monitor (muted) */}
                <circle cx="90" cy="240" r="10" fill="#71717A" opacity="0.5" />
                <circle cx="130" cy="270" r="8" fill="#71717A" opacity="0.5" />
              </svg>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#525252" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.sage }} /> Winning
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#525252" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.red }} /> At risk
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#525252" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.accent }} /> Aligned
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CUSTOM DASHBOARDS CTA */}
      <Section alt>
        <div style={{ padding: "28px", background: "#0A0A0A", color: "#FFFFFF", borderRadius: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Custom Dashboards
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, " + "40px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", margin: "0 0 20px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto" }}>
            Looking for another type of advanced analysis?
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "32px", maxWidth: "640px", marginLeft: "auto", marginRight: "auto" }}>
            Tailor your experience with Custom Dashboards built around your unique comms and reputation needs. Access Harch AI's team of experts to guide and build your custom framework, scoring methodologies, and visualizations.
          </p>
          <a href="/atelier/audit" style={{ display: "inline-block", padding: "16px 32px", background: C.sage, color: "#FFFFFF", fontSize: "15px", fontWeight: 600, textDecoration: "none", borderRadius: "8px", fontFamily: "'Inter', sans-serif" }}>
            Talk to our team →
          </a>
        </div>
      </Section>

      {/* DASHBOARD SOLUTIONS — 4 capabilities */}
      <Section>
        <SectionHeader label="Dashboard Solutions" title="Four ways to access reputation intelligence." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { title: "Industry Reputation Indexes", desc: "Get advanced topic analytics to understand what's driving reputation and access turnkey frameworks, scoring, and visualizations specific to your industry.", features: ["Tested Frameworks", "Premium Topics", "Proprietary Scoring"], color: C.sage },
            { title: "Custom Dashboard", desc: "Use Harch AI APIs to design your custom frameworks and BI visualisation. Access our team of experts to guide and build your framework, scoring methodologies, and data.", features: ["API access", "Expert guidance", "Custom framework", "BI integration"], color: C.accent },
            { title: "Industry Workspaces", desc: "Get Web App access to the entire topic framework to mine for insights and industry-exclusive topics.", features: ["Full topic framework", "Industry-exclusive topics", "Web app access"], color: C.amber },
            { title: "Reputation Dashboards", desc: "Access advanced AI-powered analyses to answer highly strategic questions, such as 'how do internal goals align with external perceptions?' Ideal for both daily monitoring and deeper analysis.", features: ["Daily monitoring", "Peer comparison", "Pillar tracking", "Materiality matrix"], color: C.sageBright },
          ].map(item => (
            <div key={item.title} style={{ padding: "28px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)", borderTop: `3px solid ${item.color}` }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.01em", margin: "0 0 12px" }}>{item.title}</h3>
              <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.6, marginBottom: "20px" }}>{item.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {item.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#525252" }}>
                    <span style={{ color: item.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* STATS */}
      <Section alt>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          <StatsGrid color={C.sage} stats={[
            { value: "100M+", label: "entities and topics labeled per day by HarchIQ" },
            { value: "5.5M+", label: "articles ingested per day" },
            { value: "120+", label: "languages translated" },
            { value: "30+", label: "Moroccan & African media sources" },
          ]} />
        </div>
      </Section>

      <CTABottom
        title="See Reputation Dashboards in action."
        subtitle="Request a personalized demo and discover how AI-powered reputation dashboards can change your business."
        color={C.sage}
      />
    </ApproachPage>
  );
}
