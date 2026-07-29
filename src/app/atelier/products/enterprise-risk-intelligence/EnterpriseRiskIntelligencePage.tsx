"use client";

import { ApproachPage, Hero, Section, SectionHeader, StatsGrid, CardGrid, CTABottom } from "../../approach/ApproachShared";

const C = { sage: "#4A7B5F", accent: "#4A5D6E", amber: "#B87333", red: "#A0524B", sageBright: "#6FA386" };

// ═══════════════════════════════════════════════════════════════
//  ENTERPRISE RISK INTELLIGENCE — Product Page (Signal AI style)
//  Anticipate. Protect. Act.
// ═══════════════════════════════════════════════════════════════

export default function EnterpriseRiskIntelligencePage() {
  return (
    <ApproachPage>
      <Hero
        eyebrow="Product · Enterprise Risk Intelligence"
        title={<>Anticipate. Protect. <span style={{ color: C.red }}>Act.</span></>}
        subtitle="Improve business resilience with structured external risk sensing and monitoring. Harch AI uses the latest AI technology and human analysis to enable risk professionals to stay ahead of the curve."
        color={C.red}
      />

      {/* THE CHALLENGE */}
      <Section>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            The Challenge
          </div>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 24px" }}>
            Keeping ahead of external risk is a new frontier of competitive advantage.
          </h2>
          <p style={{ fontSize: "17px", color: "#525252", lineHeight: 1.7, marginBottom: "32px" }}>
            For global organizations, the ever-increasing volume and velocity of external risks means risk executives struggle to stay ahead: facing a wide remit with limited resources, often working with outdated, geographically narrow, and retrospective reporting. Risk teams across Fortune 1000 enterprises require a more sophisticated approach to external risk management that leverages the latest advances in AI.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(160,82,75,0.1)", borderRadius: "100px", fontSize: "13px", fontWeight: 600, color: C.red, fontFamily: "'Inter', sans-serif" }}>
            ⚠ 32 risk categories · 6 industries · Real-time monitoring
          </div>
        </div>
      </Section>

      {/* 4 CAPABILITIES */}
      <Section alt>
        <SectionHeader label="AI for Enterprise Risk" title="Enhance your risk management workflow." />
        <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.65, marginBottom: "48px", maxWidth: "760px" }}>
          Real-time data that dynamically alerts you to significant changes in the external risk environment, improving your ability to identify and advise on mitigation.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { icon: "🔍", title: "Early Warning Risk Identification", desc: "Scan the horizon for known and unknown risks and sudden increases in risk likelihood. Understand changes to your risk profile and align external risks to internal risk registers in real-time.", color: C.red },
            { icon: "🔔", title: "Alerting & Response", desc: "Receive alerts for changes in your risk profile, notifying relevant functional leads for an immediate response. Automatically re-prioritize the Risk Matrix for new risks.", color: C.amber },
            { icon: "📊", title: "Ongoing Risk Surveillance", desc: "Track known risks for your organization and industry. Monitor occurrences of risk events and detect changes in risks before they impact the business.", color: C.accent },
            { icon: "📋", title: "Strategic Planning & Reporting", desc: "Be an integral source of intelligence for strategic planning. Benchmark against your competitors and proactively report to your risk committee with data on trends and forecasts.", color: C.sage },
          ].map(cap => (
            <div key={cap.title} style={{ padding: "32px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)", borderTop: `3px solid ${cap.color}` }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: `${cap.color}15`, color: cap.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "20px" }}>
                {cap.icon}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.01em", margin: "0 0 12px" }}>
                {cap.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, margin: 0 }}>
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* STATS */}
      <Section>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          <StatsGrid color={C.red} stats={[
            { value: "100M+", label: "entities and topics labeled per day by HarchIQ" },
            { value: "226+", label: "global markets covered" },
            { value: "120+", label: "languages translated" },
            { value: "32", label: "risk event categories monitored" },
          ]} />
        </div>
      </Section>

      {/* 360-DEGREE RISK VIEW */}
      <Section alt>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "64px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
              360-Degree Risk View
            </div>
            <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 24px" }}>
              Report a 360-degree view of your enterprise risks.
            </h2>
            <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.65, marginBottom: "24px", maxWidth: "560px" }}>
              The Harch platform tracks an extensive set of external risk indicators that are aligned to an organization's internal risk register, enabling a holistic perspective of risk that maps internal and external risk into a single dimension.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Internal risk register aligned with external indicators",
                "Single-dimension mapping for holistic risk perspective",
                "Real-time risk matrix updates",
                "Functional lead notifications for immediate response",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: "10px", fontSize: "14px", color: "#0A0A0A" }}>
                  <span style={{ color: C.red, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            {/* Risk matrix visualization */}
            <div style={{ padding: "32px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#71717A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>
                Risk Matrix (Q3 2026)
              </div>
              <svg viewBox="0 0 360 360" style={{ width: "100%", height: "auto" }}>
                {/* Quadrant backgrounds */}
                <rect x="40" y="40" width="100" height="100" fill="rgba(184,115,51,0.1)" />
                <rect x="140" y="40" width="100" height="100" fill="rgba(160,82,75,0.15)" />
                <rect x="240" y="40" width="100" height="100" fill="rgba(160,40,40,0.2)" />
                <rect x="40" y="140" width="100" height="100" fill="rgba(74,123,95,0.1)" />
                <rect x="140" y="140" width="100" height="100" fill="rgba(184,115,51,0.1)" />
                <rect x="240" y="140" width="100" height="100" fill="rgba(160,82,75,0.15)" />
                <rect x="40" y="240" width="100" height="100" fill="rgba(74,123,95,0.15)" />
                <rect x="140" y="240" width="100" height="100" fill="rgba(74,123,95,0.1)" />
                <rect x="240" y="240" width="100" height="100" fill="rgba(184,115,51,0.1)" />
                {/* Axes */}
                <line x1="40" y1="340" x2="340" y2="340" stroke="#525252" strokeWidth="1.5" />
                <line x1="40" y1="40" x2="40" y2="340" stroke="#525252" strokeWidth="1.5" />
                {/* Labels */}
                <text x="190" y="360" fontSize="10" fill="#71717A" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">Likelihood →</text>
                <text x="15" y="190" fontSize="10" fill="#71717A" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" transform="rotate(-90 15 190)">Impact →</text>
                {/* Risk dots */}
                <circle cx="290" cy="80" r="12" fill={C.red} opacity="0.9" />
                <text x="290" y="84" fontSize="9" fill="#FFFFFF" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight="700">!</text>
                <circle cx="260" cy="120" r="10" fill={C.red} opacity="0.8" />
                <circle cx="180" cy="90" r="9" fill={C.amber} opacity="0.8" />
                <circle cx="220" cy="180" r="11" fill={C.amber} opacity="0.7" />
                <circle cx="90" cy="280" r="8" fill={C.sage} opacity="0.7" />
                <circle cx="180" cy="270" r="9" fill={C.sage} opacity="0.7" />
                <circle cx="280" cy="290" r="7" fill={C.amber} opacity="0.6" />
                <circle cx="100" cy="180" r="8" fill={C.sage} opacity="0.6" />
              </svg>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#525252" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.red }} /> Critical
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#525252" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.amber }} /> Elevated
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#525252" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.sage }} /> Contained
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* COMPETITOR BENCHMARKS */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "64px", alignItems: "center" }}>
          <div>
            {/* Competitor risk benchmark visualization */}
            <div style={{ padding: "32px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#71717A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px", textAlign: "center" }}>
                Competitor Risk Benchmark — Banking
              </div>
              {[
                { name: "Bank of Africa", score: 67, color: C.red },
                { name: "Attijariwafa Bank", score: 54, color: C.amber },
                { name: "CIH Bank", score: 72, color: C.red },
                { name: "Banque Populaire", score: 58, color: C.amber },
                { name: "Industry average", score: 62, color: C.accent },
              ].map(c => (
                <div key={c.name} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#0A0A0A", fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: c.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{c.score}/100</span>
                  </div>
                  <div style={{ height: "8px", background: "#F4F4F5", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${c.score}%`, height: "100%", background: c.color, borderRadius: "4px" }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F0F0F0", fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
                Risk score = Frequency × 0.30 + Impact × 0.50 + Velocity × 0.20
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
              Competitor Risk Benchmarks
            </div>
            <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 24px" }}>
              Are you being impacted by more external risk than your competitors?
            </h2>
            <p style={{ fontSize: "16px", color: "#525252", lineHeight: 1.65, marginBottom: "24px", maxWidth: "560px" }}>
              Are the external risks facing your business the same as those facing your competitors? Are you being impacted by more external risk than is normal for your sector? The Harch platform offers comprehensive industry and competitor risk intelligence so you can benchmark your risk performance and make informed decisions.
            </p>
            <div style={{ padding: "20px", background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "10px", borderLeft: `4px solid ${C.red}` }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", marginBottom: "8px" }}>
                Harch AI detects anomalies for unknown risks
              </div>
              <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5, margin: 0 }}>
                For a given company, our engine automatically flags coverage as risk-related — detecting emerging risks before they disrupt your business.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* INDIVIDUAL EVENTS */}
      <Section alt>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>
            Individual Events
          </div>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 24px", textAlign: "center" }}>
            Discover the individual events impacting your business.
          </h2>
          <p style={{ fontSize: "17px", color: "#525252", lineHeight: 1.65, marginBottom: "48px", textAlign: "center", maxWidth: "760px", marginLeft: "auto", marginRight: "auto" }}>
            Updated in real-time, risk professionals can validate risk matrix and competitor heatmaps by drilling down into the underlying events that most impact your business risk.
          </p>
          {/* Sample events list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { date: "Jul 15, 2026", title: "BAM issues new AML circular targeting correspondent banking", impact: "High", risk: "Regulatory", color: C.red, score: 78 },
              { date: "Jul 12, 2026", title: "Bank of Africa Q2 results exceed analyst expectations", impact: "Positive", risk: "Financial", color: C.sage, score: 32 },
              { date: "Jul 10, 2026", title: "Suspected phishing campaign targeting Moroccan bank customers", impact: "Medium", risk: "Cyber", color: C.amber, score: 65 },
              { date: "Jul 08, 2026", title: "ANRT opens consultation on 5G spectrum extension", impact: "Low", risk: "Regulatory", color: C.accent, score: 28 },
              { date: "Jul 05, 2026", title: "Attijariwafa Bank announces pan-African expansion to Ghana", impact: "Positive", risk: "Strategic", color: C.sage, score: 24 },
            ].map((ev, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 80px", gap: "20px", padding: "20px 24px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)", alignItems: "center", borderLeft: `4px solid ${ev.color}` }}>
                <span style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>{ev.date}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A0A0A", marginBottom: "2px" }}>{ev.title}</div>
                  <div style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>{ev.risk} risk category</div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "100px", background: `${ev.color}15`, color: ev.color, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{ev.impact}</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: ev.color, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{ev.score}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* PRODUCTS — 5 risk products */}
      <Section>
        <SectionHeader label="Products" title="Risk intelligence tools for a unified framework." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { title: "Risk Intelligence Platform", desc: "Easily access Harch AI's real-time intelligent view of your organization's external risk environment — through AI-powered analyses, heat maps, risk matrices, and proximity.", features: ["Real-time risk view", "AI-powered analysis", "Heat maps", "Risk matrices", "Proximity scoring"], color: C.red },
            { title: "Risk Dashboards", desc: "Monitor the external risk matrix central to your risk committee reports.", features: ["Risk committee reports", "External risk matrix", "Custom KPIs", "Stakeholder views"], color: C.amber },
            { title: "Risk Briefings", desc: "Synthesize any changes in your external risk dynamics, and alert your risk team to red and amber flags that require assessment and determination.", features: ["Red/amber alerts", "Change synthesis", "Team notifications", "Assessment workflow"], color: C.accent },
            { title: "API & Integrations", desc: "Integrate advanced data feeds from Harch AI risk data into your enterprise risk or GRC solution to view and compare in a single, seamless interface.", features: ["GRC integration", "REST API", "Webhooks", "MCP server", "BI connectors"], color: C.sage },
            { title: "Risk Reports", desc: "Dive deep into your external risk environment to enable better decision-making across your business.", features: ["32-category assessment", "Mitigation plan", "90-day roadmap", "Analyst briefing"], color: C.sageBright },
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

      <CTABottom
        title="Anticipate. Protect. Act."
        subtitle="Request a personalized demo and discover how AI-powered enterprise risk intelligence can transform your risk management workflow."
        color={C.red}
      />
    </ApproachPage>
  );
}
