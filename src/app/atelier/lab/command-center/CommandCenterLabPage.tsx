"use client";

import { AtelierNav } from "../../components/AtelierNav";
import { AtelierFooter } from "../../components/AtelierFooter";
import { C } from "../../components/tokens";
import { BrandHealthCommandCenter } from "../../console/views/BrandHealthCommandCenter";
import { CrisisAlertFeed } from "../../console/views/CrisisAlertFeed";
import { KeywordSearchBar } from "../../console/views/KeywordSearchBar";
import { AISearchAssistant } from "../../console/views/AISearchAssistant";
import { ExposureTrendChart } from "../../console/views/ExposureTrendChart";
import { ShareOfVoicePanel } from "../../console/views/ShareOfVoicePanel";
import { SourceDistribution } from "../../console/views/SourceDistribution";
import { InfluencerImpactPanel } from "../../console/views/InfluencerImpactPanel";
import { CompetitorRadarChart } from "../../console/views/CompetitorRadarChart";
import { CrisisTimeline } from "../../console/views/CrisisTimeline";
import { WhatsAppDigestPreview } from "../../console/views/WhatsAppDigestPreview";
import { RegulatoryFeedWidget } from "../../console/views/RegulatoryFeedWidget";

// ═══════════════════════════════════════════════════════════════
//  COMMAND CENTER LAB — public demo of the premium widgets
//
//  Shows the two signature dashboard widgets without requiring
//  login. Perfect for Dircom demos and sales pitches.
// ═══════════════════════════════════════════════════════════════

export function CommandCenterLabPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bgSubtle, fontFamily: C.fontSans }}>
      <AtelierNav />

      <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "48px 24px" }}>
        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
            <span style={{
              fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
              padding: "4px 10px", borderRadius: "6px", background: C.bgHover, color: C.accent,
              border: `1px solid ${C.border}`,
            }}>
              HARCH IQ · COMMAND CENTER
            </span>
            <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>
              — inspired by Meltwater · Brandwatch Vizia · Dataminr · Signal AI
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 700, color: C.text,
            letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 12px",
          }}>
            Brand Health Command Center.
            <br />
            <span style={{ color: C.accent }}>Crisis Alert Feed.</span>
          </h1>
          <p style={{
            fontSize: "17px", color: C.textBody, lineHeight: 1.6, margin: 0, maxWidth: "720px",
          }}>
            Deux widgets premium qui synthétisent le meilleur des dashboards Meltwater, Brandwatch Vizia,
            Dataminr Pulse et Signal AI. Le Dircom voit en un coup d'œil : score de réputation, niveau de crise,
            sentiment distribution, share of voice, narrative émergent, visibility AI, et le feed d'alertes temps réel
            avec détection de cascade.
          </p>
        </div>

        {/* Widget 1: Brand Health Command Center */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              1. Brand Health Command Center
            </h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
              Meltwater unified view + Vizia command aesthetic + Signal AI decision augmentation
            </p>
          </div>
          <BrandHealthCommandCenter />
        </section>

        {/* Widget 2: Crisis Alert Feed */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              2. Crisis Alert Feed
            </h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
              Dataminr real-time severity feed + PeakMetrics narrative detection + cascade indicators
            </p>
          </div>
          <CrisisAlertFeed />
        </section>

        {/* Widget 3: Keyword Search Bar */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              3. Keyword Search Bar
            </h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
              Meltwater Explorer + Talkwalker filter pills — source, language, sentiment, date range
            </p>
          </div>
          <KeywordSearchBar />
        </section>

        {/* Widget 4: Exposure Trend Chart */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              4. Exposure Trend Chart
            </h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
              Meltwater multi-line exposure charts — 30-day mention volume by language, clickable legend, hover tooltip
            </p>
          </div>
          <ExposureTrendChart />
        </section>

        {/* Widget 5: AI Search Assistant */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              5. AI Search Assistant
            </h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
              Meltwater AI Search Assistant pattern — chat interface, suggested questions, grounded in reputation data
            </p>
          </div>
          <AISearchAssistant />
        </section>

        {/* Widget 6: Share of Voice */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              6. Share of Voice — Competitive Position
            </h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
              Meltwater + Talkwalker pattern — stacked bar + ranked competitor rows with sentiment + trend
            </p>
          </div>
          <ShareOfVoicePanel />
        </section>

        {/* Widget 7: Source Distribution */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              7. Source Distribution
            </h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
              Meltwater + Talkwalker donut chart — interactive hover, media/social/regulatory breakdown
            </p>
          </div>
          <SourceDistribution />
        </section>

        {/* Design rationale */}
        <section style={{
          padding: "32px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Design rationale — what we took from each competitor
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            <DesignCard
              competitor="Meltwater"
              pattern="Unified Dashboards"
              what="All metrics in one customizable view — score, sentiment, share of voice, competitive rank."
            />
            <DesignCard
              competitor="Brandwatch Vizia"
              pattern="Command Center"
              what="Big bold metrics, real-time pulse, escalate important insights. The crisis level indicator with pulsing ring."
            />
            <DesignCard
              competitor="Dataminr Pulse"
              pattern="Earliest Warning"
              what="Real-time severity-coded feed, cascade detection, hyperlocal alerts. The acknowledge/escalate actions."
            />
            <DesignCard
              competitor="Signal AI"
              pattern="Decision Augmentation"
              what="Contextual recommendations, not just data. The HarchIQ recommendation panel with crisis-aware CTAs."
            />
            <DesignCard
              competitor="PeakMetrics"
              pattern="Narrative Detection"
              what="Emerging themes with momentum tracking. The 'Top Emerging Narrative' widget with rising/falling/stable."
            />
            <DesignCard
              competitor="Harch (unique)"
              pattern="AI Visibility Matrix"
              what="What ChatGPT, Claude, Gemini, Perplexity say about you. No competitor has this."
            />
          </div>
        </section>
      </main>

      <div style={{ marginTop: "auto" }}>
        <AtelierFooter />
      </div>
    </div>
  );
}

function DesignCard({ competitor, pattern, what }: { competitor: string; pattern: string; what: string }) {
  return (
    <div style={{ padding: "16px", background: C.bgHover, borderRadius: "8px", border: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
        {competitor}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>{pattern}</div>
      <p style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.5, margin: 0 }}>{what}</p>
    </div>
  );
}
