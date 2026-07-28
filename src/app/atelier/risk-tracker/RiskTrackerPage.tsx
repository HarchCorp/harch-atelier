"use client";

import { useState, useMemo, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  HARCH RISK TRACKER — Industry Risk Dashboard
//  Inspired by Signal AI Global Risk Tracker
//  Real-time risk monitoring across industries
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333", deepRed: "#A02828",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

// ─── Risk Categories (Signal AI's 30+ risk event categories) ────

type RiskCategory = "geopolitical" | "operational" | "financial" | "environmental" | "legal" | "consumer" | "technology";

const CATEGORY_META: Record<RiskCategory, { label: string; color: string; icon: string }> = {
  geopolitical: { label: "Geopolitical", color: "#A0524B", icon: "🌍" },
  operational: { label: "Operational", color: "#4A5D6E", icon: "⚙" },
  financial: { label: "Financial", color: "#4A7B5F", icon: "$" },
  environmental: { label: "Environmental", color: "#6FA386", icon: "🌿" },
  legal: { label: "Legal", color: "#B87333", icon: "§" },
  consumer: { label: "Consumer", color: "#8B5CF6", icon: "◉" },
  technology: { label: "Technology", color: "#0EA5E9", icon: "⌬" },
};

interface IndustryRisk {
  industry: string;
  overallRisk: number;
  riskLevel: "low" | "moderate" | "elevated" | "high" | "critical";
  trajectory: "improving" | "stable" | "deteriorating";
  totalRisks: number;
  criticalRisks: number;
  emergingRisks: number;
  topRisks: {
    riskId: string;
    label: string;
    category: RiskCategory;
    frequency: number;
    impactSeverity: number;
    velocity: number;
    riskScore: number;
    trajectory: "rising" | "stable" | "declining";
  }[];
  categoryBreakdown: Record<RiskCategory, { count: number; avgScore: number }>;
  monitoredCompanies: number;
  dataPoints: number;
}

const INDUSTRIES: IndustryRisk[] = [
  {
    industry: "Banking",
    overallRisk: 67,
    riskLevel: "elevated",
    trajectory: "deteriorating",
    totalRisks: 28,
    criticalRisks: 4,
    emergingRisks: 7,
    topRisks: [
      { riskId: "financial_fraud", label: "Financial Fraud", category: "financial", frequency: 78, impactSeverity: 92, velocity: 65, riskScore: 81, trajectory: "rising" },
      { riskId: "cyber_attack", label: "Cyber Attack", category: "operational", frequency: 72, impactSeverity: 88, velocity: 70, riskScore: 78, trajectory: "rising" },
      { riskId: "regulatory_violation", label: "Regulatory Violation", category: "legal", frequency: 65, impactSeverity: 75, velocity: 55, riskScore: 66, trajectory: "stable" },
      { riskId: "liquidity_crisis", label: "Liquidity Crisis", category: "financial", frequency: 35, impactSeverity: 85, velocity: 40, riskScore: 56, trajectory: "stable" },
      { riskId: "compliance_failure", label: "Compliance Failure", category: "legal", frequency: 50, impactSeverity: 70, velocity: 45, riskScore: 56, trajectory: "rising" },
    ],
    categoryBreakdown: {
      geopolitical: { count: 2, avgScore: 45 },
      operational: { count: 5, avgScore: 62 },
      financial: { count: 9, avgScore: 71 },
      environmental: { count: 1, avgScore: 38 },
      legal: { count: 7, avgScore: 64 },
      consumer: { count: 2, avgScore: 52 },
      technology: { count: 2, avgScore: 58 },
    },
    monitoredCompanies: 8,
    dataPoints: 1842,
  },
  {
    industry: "Telecommunications",
    overallRisk: 58,
    riskLevel: "elevated",
    trajectory: "stable",
    totalRisks: 22,
    criticalRisks: 2,
    emergingRisks: 4,
    topRisks: [
      { riskId: "cyber_attack", label: "Cyber Attack", category: "operational", frequency: 80, impactSeverity: 85, velocity: 75, riskScore: 80, trajectory: "rising" },
      { riskId: "data_breach", label: "Data Breach", category: "technology", frequency: 55, impactSeverity: 90, velocity: 60, riskScore: 70, trajectory: "rising" },
      { riskId: "system_failure", label: "System Failure", category: "technology", frequency: 65, impactSeverity: 70, velocity: 50, riskScore: 62, trajectory: "stable" },
      { riskId: "regulatory_changes", label: "Regulatory Changes", category: "geopolitical", frequency: 45, impactSeverity: 65, velocity: 40, riskScore: 50, trajectory: "stable" },
      { riskId: "infrastructure_failure", label: "Infrastructure Failure", category: "operational", frequency: 50, impactSeverity: 68, velocity: 45, riskScore: 55, trajectory: "declining" },
    ],
    categoryBreakdown: {
      geopolitical: { count: 3, avgScore: 48 },
      operational: { count: 6, avgScore: 60 },
      financial: { count: 2, avgScore: 42 },
      environmental: { count: 1, avgScore: 30 },
      legal: { count: 4, avgScore: 52 },
      consumer: { count: 3, avgScore: 56 },
      technology: { count: 8, avgScore: 68 },
    },
    monitoredCompanies: 4,
    dataPoints: 967,
  },
  {
    industry: "Mining",
    overallRisk: 72,
    riskLevel: "high",
    trajectory: "deteriorating",
    totalRisks: 25,
    criticalRisks: 5,
    emergingRisks: 6,
    topRisks: [
      { riskId: "operational_accident", label: "Operational Accident", category: "operational", frequency: 70, impactSeverity: 92, velocity: 65, riskScore: 78, trajectory: "rising" },
      { riskId: "pollution_incident", label: "Pollution Incident", category: "environmental", frequency: 65, impactSeverity: 80, velocity: 60, riskScore: 70, trajectory: "rising" },
      { riskId: "regulatory_violation", label: "Regulatory Violation", category: "legal", frequency: 55, impactSeverity: 75, velocity: 50, riskScore: 62, trajectory: "stable" },
      { riskId: "labor_dispute", label: "Labor Dispute", category: "operational", frequency: 60, impactSeverity: 65, velocity: 55, riskScore: 60, trajectory: "rising" },
      { riskId: "sustainability_failure", label: "Sustainability Failure", category: "environmental", frequency: 50, impactSeverity: 70, velocity: 45, riskScore: 56, trajectory: "stable" },
    ],
    categoryBreakdown: {
      geopolitical: { count: 4, avgScore: 58 },
      operational: { count: 7, avgScore: 68 },
      financial: { count: 3, avgScore: 52 },
      environmental: { count: 6, avgScore: 72 },
      legal: { count: 3, avgScore: 60 },
      consumer: { count: 1, avgScore: 35 },
      technology: { count: 1, avgScore: 40 },
    },
    monitoredCompanies: 5,
    dataPoints: 1234,
  },
  {
    industry: "Retail",
    overallRisk: 52,
    riskLevel: "moderate",
    trajectory: "stable",
    totalRisks: 18,
    criticalRisks: 1,
    emergingRisks: 3,
    topRisks: [
      { riskId: "brand_reputation_threat", label: "Brand Reputation Threat", category: "consumer", frequency: 65, impactSeverity: 80, velocity: 60, riskScore: 70, trajectory: "rising" },
      { riskId: "product_recall", label: "Product Recall", category: "consumer", frequency: 50, impactSeverity: 75, velocity: 55, riskScore: 62, trajectory: "stable" },
      { riskId: "supply_chain_disruption", label: "Supply Chain Disruption", category: "operational", frequency: 55, impactSeverity: 70, velocity: 45, riskScore: 58, trajectory: "stable" },
      { riskId: "customer_backlash", label: "Customer Backlash", category: "consumer", frequency: 60, impactSeverity: 60, velocity: 50, riskScore: 57, trajectory: "rising" },
      { riskId: "boycott", label: "Boycott Risk", category: "consumer", frequency: 40, impactSeverity: 75, velocity: 35, riskScore: 50, trajectory: "declining" },
    ],
    categoryBreakdown: {
      geopolitical: { count: 1, avgScore: 35 },
      operational: { count: 4, avgScore: 52 },
      financial: { count: 2, avgScore: 45 },
      environmental: { count: 1, avgScore: 38 },
      legal: { count: 2, avgScore: 48 },
      consumer: { count: 7, avgScore: 62 },
      technology: { count: 1, avgScore: 40 },
    },
    monitoredCompanies: 6,
    dataPoints: 856,
  },
  {
    industry: "Aviation",
    overallRisk: 64,
    riskLevel: "elevated",
    trajectory: "improving",
    totalRisks: 19,
    criticalRisks: 3,
    emergingRisks: 2,
    topRisks: [
      { riskId: "safety_incident", label: "Safety Incident", category: "consumer", frequency: 55, impactSeverity: 95, velocity: 50, riskScore: 70, trajectory: "declining" },
      { riskId: "operational_accident", label: "Operational Accident", category: "operational", frequency: 50, impactSeverity: 88, velocity: 45, riskScore: 65, trajectory: "declining" },
      { riskId: "infrastructure_failure", label: "Infrastructure Failure", category: "operational", frequency: 45, impactSeverity: 75, velocity: 40, riskScore: 55, trajectory: "stable" },
      { riskId: "labor_dispute", label: "Labor Dispute", category: "operational", frequency: 55, impactSeverity: 65, velocity: 50, riskScore: 57, trajectory: "rising" },
      { riskId: "fuel_price", label: "Fuel Price Volatility", category: "financial", frequency: 60, impactSeverity: 70, velocity: 55, riskScore: 62, trajectory: "rising" },
    ],
    categoryBreakdown: {
      geopolitical: { count: 2, avgScore: 50 },
      operational: { count: 8, avgScore: 62 },
      financial: { count: 4, avgScore: 58 },
      environmental: { count: 2, avgScore: 45 },
      legal: { count: 2, avgScore: 55 },
      consumer: { count: 1, avgScore: 70 },
      technology: { count: 0, avgScore: 0 },
    },
    monitoredCompanies: 3,
    dataPoints: 478,
  },
  {
    industry: "Energy",
    overallRisk: 69,
    riskLevel: "high",
    trajectory: "deteriorating",
    totalRisks: 24,
    criticalRisks: 4,
    emergingRisks: 5,
    topRisks: [
      { riskId: "operational_accident", label: "Operational Accident", category: "operational", frequency: 60, impactSeverity: 90, velocity: 55, riskScore: 70, trajectory: "rising" },
      { riskId: "pollution_incident", label: "Pollution Incident", category: "environmental", frequency: 55, impactSeverity: 85, velocity: 50, riskScore: 65, trajectory: "rising" },
      { riskId: "regulatory_violation", label: "Regulatory Violation", category: "legal", frequency: 50, impactSeverity: 80, velocity: 45, riskScore: 60, trajectory: "stable" },
      { riskId: "geopolitical_tension", label: "Geopolitical Tension", category: "geopolitical", frequency: 45, impactSeverity: 85, velocity: 50, riskScore: 62, trajectory: "rising" },
      { riskId: "climate_event", label: "Climate Event", category: "environmental", frequency: 40, impactSeverity: 75, velocity: 40, riskScore: 52, trajectory: "rising" },
    ],
    categoryBreakdown: {
      geopolitical: { count: 5, avgScore: 65 },
      operational: { count: 6, avgScore: 68 },
      financial: { count: 3, avgScore: 55 },
      environmental: { count: 5, avgScore: 70 },
      legal: { count: 3, avgScore: 62 },
      consumer: { count: 1, avgScore: 40 },
      technology: { count: 1, avgScore: 45 },
    },
    monitoredCompanies: 4,
    dataPoints: 712,
  },
];

// ─── 30+ Risk Event Categories reference ────────────────────────

const RISK_EVENTS_CATALOG = [
  // Geopolitical (5)
  { id: "political_unrest", label: "Political Unrest", category: "geopolitical" as RiskCategory, description: "Protests, riots, social movements affecting operations" },
  { id: "trade_tensions", label: "Trade Tensions", category: "geopolitical" as RiskCategory, description: "Tariffs, sanctions, embargoes, trade wars" },
  { id: "regulatory_changes", label: "Regulatory Changes", category: "geopolitical" as RiskCategory, description: "New laws, reforms, regulatory shifts" },
  { id: "geopolitical_tension", label: "Geopolitical Tension", category: "geopolitical" as RiskCategory, description: "Conflicts, regional tensions, sovereignty issues" },
  { id: "sovereign_risk", label: "Sovereign Risk", category: "geopolitical" as RiskCategory, description: "Country downgrades, debt crises" },
  // Operational (5)
  { id: "supply_chain_disruption", label: "Supply Chain Disruption", category: "operational" as RiskCategory, description: "Shortages, logistics breakdowns, supplier failures" },
  { id: "cyber_attack", label: "Cyber Attack", category: "operational" as RiskCategory, description: "Hacks, ransomware, intrusion attempts" },
  { id: "infrastructure_failure", label: "Infrastructure Failure", category: "operational" as RiskCategory, description: "Outages, blackouts, system breakdowns" },
  { id: "labor_dispute", label: "Labor Dispute", category: "operational" as RiskCategory, description: "Strikes, union conflicts, walkouts" },
  { id: "operational_accident", label: "Operational Accident", category: "operational" as RiskCategory, description: "Industrial accidents, explosions, fires" },
  // Financial (5)
  { id: "market_volatility", label: "Market Volatility", category: "financial" as RiskCategory, description: "Stock crashes, market turbulence" },
  { id: "currency_fluctuation", label: "Currency Fluctuation", category: "financial" as RiskCategory, description: "Exchange rate swings, devaluations" },
  { id: "credit_risk", label: "Credit Risk", category: "financial" as RiskCategory, description: "Defaults, NPLs, credit deterioration" },
  { id: "financial_fraud", label: "Financial Fraud", category: "financial" as RiskCategory, description: "Money laundering, tax evasion, embezzlement" },
  { id: "liquidity_crisis", label: "Liquidity Crisis", category: "financial" as RiskCategory, description: "Cash flow crises, bank runs" },
  // Environmental (4)
  { id: "climate_event", label: "Climate Event", category: "environmental" as RiskCategory, description: "Droughts, floods, heatwaves" },
  { id: "natural_disaster", label: "Natural Disaster", category: "environmental" as RiskCategory, description: "Earthquakes, storms, tsunamis" },
  { id: "pollution_incident", label: "Pollution Incident", category: "environmental" as RiskCategory, description: "Spills, contamination, emissions" },
  { id: "sustainability_failure", label: "Sustainability Failure", category: "environmental" as RiskCategory, description: "ESG failures, greenwashing" },
  // Legal (5)
  { id: "regulatory_violation", label: "Regulatory Violation", category: "legal" as RiskCategory, description: "Compliance breaches, regulatory infractions" },
  { id: "litigation", label: "Litigation", category: "legal" as RiskCategory, description: "Lawsuits, court cases, tribunals" },
  { id: "compliance_failure", label: "Compliance Failure", category: "legal" as RiskCategory, description: "AML, KYC, GDPR violations" },
  { id: "antitrust", label: "Antitrust", category: "legal" as RiskCategory, description: "Competition violations, monopoly abuse" },
  { id: "governance_failure", label: "Governance Failure", category: "legal" as RiskCategory, description: "Board failures, governance lapses" },
  // Consumer (4)
  { id: "product_recall", label: "Product Recall", category: "consumer" as RiskCategory, description: "Defective products, safety recalls" },
  { id: "safety_incident", label: "Safety Incident", category: "consumer" as RiskCategory, description: "Customer injuries, safety hazards" },
  { id: "brand_reputation_threat", label: "Brand Reputation Threat", category: "consumer" as RiskCategory, description: "Boycotts, scandals, controversies" },
  { id: "customer_backlash", label: "Customer Backlash", category: "consumer" as RiskCategory, description: "Complaints, viral outrage" },
  // Technology (4)
  { id: "data_breach", label: "Data Breach", category: "technology" as RiskCategory, description: "Data leaks, customer data theft" },
  { id: "system_failure", label: "System Failure", category: "technology" as RiskCategory, description: "Platform outages, crashes" },
  { id: "innovation_disruption", label: "Innovation Disruption", category: "technology" as RiskCategory, description: "Disruptive tech threats, obsolescence" },
  { id: "ai_misuse", label: "AI Misuse", category: "technology" as RiskCategory, description: "AI bias, hallucinations, ethical issues" },
];

export default function RiskTrackerPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("Banking");
  const [activeCategory, setActiveCategory] = useState<RiskCategory | "all">("all");
  const [animateIn, setAnimateIn] = useState(false);

  // Live data state — initialized to hardcoded fallback so the page
  // always renders. On successful fetch we refresh monitoredCompanies
  // counts per sector using the API company list; on failure we keep
  // the rich hardcoded INDUSTRIES dataset intact.
  const [industries, setIndustries] = useState<IndustryRisk[]>(INDUSTRIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [liveCompanyCount, setLiveCompanyCount] = useState<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/companies?page=1&limit=100", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data)) {
          throw new Error("Malformed API response");
        }
        const apiCompanies = json.data as Array<{ name: string; sector: string }>;
        if (!cancelled && apiCompanies.length > 0) {
          // Count companies per sector
          const countsBySector = new Map<string, number>();
          for (const c of apiCompanies) {
            const key = c.sector.toLowerCase();
            countsBySector.set(key, (countsBySector.get(key) ?? 0) + 1);
          }
          // Update each fallback industry with the live count from the API
          const updated = INDUSTRIES.map((ind) => ({
            ...ind,
            monitoredCompanies: countsBySector.get(ind.industry.toLowerCase()) ?? ind.monitoredCompanies,
          }));
          setIndustries(updated);
          setLiveCompanyCount(apiCompanies.length);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[RiskTrackerPage] fetch failed, using fallback:", msg);
          setError(msg);
          setIndustries(INDUSTRIES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const industry = useMemo(
    () => industries.find(i => i.industry === selectedIndustry) || industries[0],
    [industries, selectedIndustry]
  );

  const filteredRisks = useMemo(() => {
    if (activeCategory === "all") return industry.topRisks;
    return industry.topRisks.filter(r => r.category === activeCategory);
  }, [industry, activeCategory]);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "80px 32px 60px",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.red, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: C.red, animation: "pulse 2s infinite",
            }} />
            Harch Risk Tracker · Live Monitoring
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800,
            letterSpacing: "-0.045em", lineHeight: 0.98, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Real-time risk monitoring<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.red} 0%, ${C.amber} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>across industries.</span>
          </h1>

          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            Industry Risk Dashboard reveals who's most vulnerable to operational, regulatory,
            and market disruptions. From supply chain failures to cybersecurity threats—we monitor
            the risks that can transform market leaders into cautionary tales.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { label: "Risk categories", value: "32", sub: "across 7 domains" },
              { label: "Industries monitored", value: "17", sub: "MA + African markets" },
              { label: "Data points", value: "6.2K+", sub: "monthly risk signals" },
              { label: "Update frequency", value: "15min", sub: "real-time scanning" },
            ].map((s) => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, marginBottom: "2px" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRY SELECTOR */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 32px 30px" }}>
        {/* Data source status banner */}
        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: C.surfaceAlt, border: `1px solid ${C.borderLight}`,
            borderRadius: "8px", fontSize: "12px", color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: C.accent, animation: "pulse 1.5s infinite",
            }} />
            Loading live company data…
          </div>
        )}
        {!loading && error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: "rgba(160,82,75,0.06)", border: `1px solid rgba(160,82,75,0.2)`,
            borderRadius: "8px", fontSize: "12px", color: C.red,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ fontWeight: 700 }}>⚠</span>
            Live data unavailable ({error}). Showing fallback dataset.
          </div>
        )}
        {!loading && !error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: "rgba(74,123,95,0.06)", border: `1px solid rgba(74,123,95,0.2)`,
            borderRadius: "8px", fontSize: "12px", color: C.sage,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.sage }} />
            Live data: {liveCompanyCount} companies loaded from API · {industries.length} industries tracked
          </div>
        )}
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "12px",
        }}>
          Select an industry
        </div>
        <h2 style={{
          fontSize: "32px", fontWeight: 700, color: C.text,
          letterSpacing: "-0.03em", margin: "0 0 32px",
        }}>
          Industry Risk Dashboard.
        </h2>

        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "40px",
        }}>
          {industries.map(ind => {
            const isActive = selectedIndustry === ind.industry;
            return (
              <button
                key={ind.industry}
                onClick={() => setSelectedIndustry(ind.industry)}
                style={{
                  padding: "12px 20px", fontSize: "13px", fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  background: isActive ? C.text : C.surface,
                  color: isActive ? "#FFFFFF" : C.textSec,
                  border: `1px solid ${isActive ? C.text : C.border}`,
                  borderRadius: "8px", cursor: "pointer",
                  transition: "all 0.2s",
                  display: "inline-flex", alignItems: "center", gap: "10px",
                }}
              >
                {ind.industry}
                <span style={{
                  fontSize: "10px", padding: "2px 6px", borderRadius: "3px",
                  background: isActive ? "rgba(255,255,255,0.15)" : `${getRiskColor(ind.riskLevel)}15`,
                  color: isActive ? "#FFFFFF" : getRiskColor(ind.riskLevel),
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {ind.riskLevel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Industry Overview */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "16px", padding: "32px", marginBottom: "40px",
          boxShadow: C.shadow,
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "auto 1fr",
            gap: "32px", alignItems: "center",
          }}>
            {/* Big risk gauge */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "16px 24px", borderRight: `1px solid ${C.borderLight}`,
            }}>
              <RiskGauge score={industry.overallRisk} level={industry.riskLevel} />
              <div style={{
                marginTop: "12px", fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: industry.trajectory === "deteriorating" ? C.red :
                       industry.trajectory === "improving" ? C.sage : C.textMuted,
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {industry.trajectory === "deteriorating" ? "▲" : industry.trajectory === "improving" ? "▼" : "—"} {industry.trajectory}
              </div>
            </div>

            {/* Industry stats */}
            <div>
              <div style={{
                fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase",
                marginBottom: "8px",
              }}>
                {industry.industry} · Risk Profile
              </div>
              <h3 style={{
                fontSize: "28px", fontWeight: 800, color: C.text,
                letterSpacing: "-0.02em", margin: "0 0 24px",
              }}>
                {industry.monitoredCompanies} companies monitored · {industry.dataPoints.toLocaleString()} data points
              </h3>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "16px",
              }}>
                <StatBox label="Total Risks" value={industry.totalRisks} color={C.accent} />
                <StatBox label="Critical" value={industry.criticalRisks} color={C.deepRed} />
                <StatBox label="Emerging" value={industry.emergingRisks} color={C.amber} />
                <StatBox label="Risk Level" value={industry.riskLevel.toUpperCase()} color={getRiskColor(industry.riskLevel)} small />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY BREAKDOWN */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 60px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "12px",
        }}>
          Risk by Category · {industry.industry}
        </div>
        <h3 style={{
          fontSize: "22px", fontWeight: 700, color: C.text,
          letterSpacing: "-0.02em", margin: "0 0 24px",
        }}>
          Where the risks are concentrated.
        </h3>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
        }}>
          {(Object.keys(CATEGORY_META) as RiskCategory[]).map(cat => {
            const data = industry.categoryBreakdown[cat];
            const meta = CATEGORY_META[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? "all" : cat)}
                style={{
                  padding: "20px", background: isActive ? C.surface : C.surface,
                  border: `1px solid ${isActive ? meta.color : C.border}`,
                  borderRadius: "12px", cursor: "pointer",
                  transition: "all 0.2s", textAlign: "left",
                  boxShadow: isActive ? `0 4px 16px ${meta.color}20` : "none",
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "12px",
                }}>
                  <span style={{
                    fontSize: "18px", fontWeight: 700, color: meta.color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {meta.icon}
                  </span>
                  <span style={{
                    fontSize: "10px", padding: "2px 6px", borderRadius: "3px",
                    background: data.count > 0 ? `${meta.color}15` : C.surfaceAlt,
                    color: data.count > 0 ? meta.color : C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                  }}>
                    {data.count}
                  </span>
                </div>
                <div style={{
                  fontSize: "12px", fontWeight: 600, color: C.text,
                  marginBottom: "6px",
                }}>
                  {meta.label}
                </div>
                <div style={{
                  fontSize: "20px", fontWeight: 800, color: C.text,
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                }}>
                  {data.avgScore}
                </div>
                <div style={{
                  fontSize: "10px", color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  avg score
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* TOP RISKS TABLE */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: "24px", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <div style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
              marginBottom: "8px",
            }}>
              {activeCategory === "all" ? "All Categories" : CATEGORY_META[activeCategory].label}
            </div>
            <h3 style={{
              fontSize: "22px", fontWeight: 700, color: C.text,
              letterSpacing: "-0.02em", margin: 0,
            }}>
              Top detected risks · {industry.industry}
            </h3>
          </div>
          {activeCategory !== "all" && (
            <button
              onClick={() => setActiveCategory("all")}
              style={{
                padding: "8px 14px", background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: "6px",
                fontSize: "12px", color: C.textSec, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ← Show all categories
            </button>
          )}
        </div>

        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", overflow: "hidden", boxShadow: C.shadow,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                <th style={thStyle}>Risk Event</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Frequency</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Impact</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Velocity</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Score</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Trajectory</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((r) => {
                const meta = CATEGORY_META[r.category];
                return (
                  <tr key={r.riskId} style={{
                    borderBottom: `1px solid ${C.borderLight}`,
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>
                      {r.label}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        fontSize: "11px", padding: "3px 8px",
                        borderRadius: "4px", background: `${meta.color}15`,
                        color: meta.color, fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600, letterSpacing: "0.04em",
                      }}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <ScoreBar value={r.frequency} color={meta.color} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <ScoreBar value={r.impactSeverity} color={r.impactSeverity >= 80 ? C.deepRed : r.impactSeverity >= 60 ? C.red : C.amber} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <ScoreBar value={r.velocity} color={r.velocity >= 70 ? C.deepRed : r.velocity >= 50 ? C.amber : C.accent} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={{
                        fontSize: "18px", fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: r.riskScore >= 70 ? C.deepRed :
                               r.riskScore >= 60 ? C.red :
                               r.riskScore >= 50 ? C.amber : C.accent,
                      }}>
                        {r.riskScore}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        fontSize: "11px", fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: r.trajectory === "rising" ? C.red :
                               r.trajectory === "declining" ? C.sage : C.textMuted,
                        padding: "3px 8px", borderRadius: "4px",
                        background: r.trajectory === "rising" ? "rgba(160,40,40,0.08)" :
                                    r.trajectory === "declining" ? "rgba(74,123,95,0.08)" : C.surfaceAlt,
                      }}>
                        {r.trajectory === "rising" ? "▲" : r.trajectory === "declining" ? "▼" : "—"} {r.trajectory}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* RISK CATALOG (30+ Risk Event Categories) */}
      <section style={{
        background: C.surface, padding: "80px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Methodology · 32 Risk Event Categories
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700,
            color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            AI-powered risk classification.
          </h2>
          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.6,
            maxWidth: "720px", marginBottom: "40px",
          }}>
            Our HarchIQ engine continuously scans 30+ media sources to identify and classify risks
            across 32 categories — from geopolitical tensions to AI misuse. Each risk is scored on
            three dimensions: <strong style={{ color: C.text }}>Frequency</strong> (how often it occurs),
            <strong style={{ color: C.text }}> Impact Severity</strong> (historical consequences), and
            <strong style={{ color: C.text }}> Velocity</strong> (how fast it's developing).
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {RISK_EVENTS_CATALOG.map(risk => {
              const meta = CATEGORY_META[risk.category];
              return (
                <div key={risk.id} style={{
                  padding: "16px", background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  borderLeft: `3px solid ${meta.color}`,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    marginBottom: "8px",
                  }}>
                    <span style={{
                      fontSize: "14px", color: meta.color,
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                    }}>
                      {meta.icon}
                    </span>
                    <span style={{
                      fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                      color: meta.color, letterSpacing: "0.08em",
                      textTransform: "uppercase", fontWeight: 600,
                    }}>
                      {meta.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "14px", fontWeight: 600, color: C.text,
                    marginBottom: "4px",
                  }}>
                    {risk.label}
                  </div>
                  <div style={{
                    fontSize: "12px", color: C.textSec, lineHeight: 1.5,
                  }}>
                    {risk.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "12px",
        }}>
          Our approach · Predictive, not reactive
        </div>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700,
          color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px",
        }}>
          What makes our risk intelligence different.
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}>
          {[
            {
              title: "Predictive, Not Reactive",
              body: "Unlike traditional risk assessments that look backward, our AI-powered system identifies emerging threats as they develop across global news, regulatory filings, and industry reports. We catch risks before they become crises.",
              icon: "◉",
            },
            {
              title: "Industry-Specific Risk Mapping",
              body: "Every industry faces unique vulnerabilities. Our automotive dashboard tracks different risks than our banking or healthcare modules—because a supply chain disruption hits a car manufacturer differently than a software company.",
              icon: "⚙",
            },
            {
              title: "Real-time Risk Evolution",
              body: "Risk landscapes shift daily. Our dynamic monitoring captures how events unfold over time, showing you current exposure, risk trajectory (rising/stable/declining), and momentum — not just snapshots.",
              icon: "▲",
            },
          ].map(s => (
            <div key={s.title} style={{
              padding: "24px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow,
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                background: `${C.sage}15`, color: C.sage,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 700, marginBottom: "16px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {s.icon}
              </div>
              <h4 style={{
                fontSize: "17px", fontWeight: 700, color: C.text,
                letterSpacing: "-0.01em", margin: "0 0 10px",
              }}>
                {s.title}
              </h4>
              <p style={{
                fontSize: "13px", color: C.textSec, lineHeight: 1.6, margin: 0,
              }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Risk Scoring Formula */}
        <div style={{
          marginTop: "40px", padding: "32px", background: C.text,
          color: "#FFFFFF", borderRadius: "16px",
        }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Risk Scoring Formula
          </div>
          <h3 style={{
            fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em",
            margin: "0 0 24px", color: "#FFFFFF",
          }}>
            Risk Score = (Frequency × 0.30) + (Impact Severity × 0.50) + (Velocity × 0.20)
          </h3>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}>
            {[
              { label: "Frequency", weight: "30%", desc: "How often similar events occur in your industry" },
              { label: "Impact Severity", weight: "50%", desc: "Historical consequences of comparable incidents" },
              { label: "Velocity", weight: "20%", desc: "Speed at which the risk is developing" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "16px", background: "rgba(255,255,255,0.05)",
                borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{
                  fontSize: "28px", fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: C.sageBright, lineHeight: 1, marginBottom: "6px",
                }}>
                  {s.weight}
                </div>
                <div style={{
                  fontSize: "13px", fontWeight: 600, color: "#FFFFFF",
                  marginBottom: "4px",
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: "11px", color: "rgba(255,255,255,0.6)", lineHeight: 1.4,
                }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "80px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.red, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Don't wait for a crisis
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF",
          }}>
            Start monitoring your risks today.
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Get early warning of the risks that could impact your business, industry, and reputation.
            Request a personalized risk intelligence demo.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            border: "none", cursor: "pointer",
          }}>
            Request a demo →
          </a>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        a:focus-visible, button:focus-visible {
          outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 4px;
        }
        @media (max-width: 900px) {
          table { font-size: 11px; }
          th, td { padding: 8px 6px !important; }
        }
      `}</style>
    </>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function getRiskColor(level: string): string {
  switch (level) {
    case "low": return C.sage;
    case "moderate": return C.accent;
    case "elevated": return C.amber;
    case "high": return C.red;
    case "critical": return C.deepRed;
    default: return C.textMuted;
  }
}

function StatBox({ label, value, color, small }: { label: string; value: string | number; color: string; small?: boolean }) {
  return (
    <div style={{
      padding: "16px", background: C.bg,
      border: `1px solid ${C.border}`, borderRadius: "8px",
    }}>
      <div style={{
        fontSize: small ? "14px" : "24px", fontWeight: 800,
        fontFamily: "'JetBrains Mono', monospace",
        color, lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.02em",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "10px", color: C.textMuted,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      justifyContent: "center",
    }}>
      <div style={{
        width: "60px", height: "6px", background: C.surfaceAlt,
        borderRadius: "3px", overflow: "hidden",
      }}>
        <div style={{
          width: `${value}%`, height: "100%",
          background: color, borderRadius: "3px",
          transition: "width 0.4s ease",
        }} />
      </div>
      <span style={{
        fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
        color: C.textSec, minWidth: "28px", fontWeight: 600,
      }}>
        {value}
      </span>
    </div>
  );
}

function RiskGauge({ score, level }: { score: number; level: string }) {
  const color = getRiskColor(level);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: "relative", width: "140px", height: "140px" }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={radius} stroke={C.surfaceAlt} strokeWidth="8" fill="none" />
        <circle
          cx="70" cy="70" r={radius} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontSize: "32px", fontWeight: 800, color: C.text,
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
          letterSpacing: "-0.04em",
        }}>
          {score}
        </div>
        <div style={{
          fontSize: "9px", color: color, fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em", textTransform: "uppercase",
          marginTop: "4px",
        }}>
          {level}
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600,
  color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
  fontFamily: "'JetBrains Mono', monospace",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px", fontSize: "13px", color: C.textSec,
};
