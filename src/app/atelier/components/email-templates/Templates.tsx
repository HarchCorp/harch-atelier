"use client";

// ═══════════════════════════════════════════════════════════════
//  EMAIL TEMPLATES — Marketing outreach with blur teaser
//  Reusable templates for different client segments
// ═══════════════════════════════════════════════════════════════

interface EmailTemplateProps {
  recipientName: string;
  recipientCompany: string;
  sector: string;
  reputationScore: number;
  sentimentPositive: number;
  emergingRisk: string;
  competitorName: string;
  competitorScore: number;
}

// ─── COLD OUTREACH EMAIL TEMPLATE ────────────────────────────────
export function ColdOutreachEmail({ data }: { data: EmailTemplateProps }) {
  return (
    <div style={emailStyles.container}>
      <div style={emailStyles.subject}>
        <strong>Subject:</strong> {data.recipientCompany} — Reputation Score: {data.reputationScore}/100
      </div>
      <div style={emailStyles.body}>
        <p style={emailStyles.text}>Dear {data.recipientName},</p>
        <p style={emailStyles.text}>
          We analyzed {data.recipientCompany}'s media presence and AI visibility across 
          30+ Moroccan and African media sources. Here's what we found:
        </p>
        
        <div style={emailStyles.statBox}>
          <div style={emailStyles.statRow}>
            <span style={emailStyles.statLabel}>Reputation Score</span>
            <span style={emailStyles.statValue}>{data.reputationScore}/100</span>
          </div>
          <div style={emailStyles.statRow}>
            <span style={emailStyles.statLabel}>Positive Sentiment</span>
            <span style={emailStyles.statValue}>{data.sentimentPositive}%</span>
          </div>
          <div style={emailStyles.statRow}>
            <span style={emailStyles.statLabel}>Top Competitor</span>
            <span style={emailStyles.statValue}>{data.competitorName} ({data.competitorScore}/100)</span>
          </div>
        </div>

        <p style={emailStyles.text}>
          <strong style={{ color: "#A0524B" }}>⚠ Emerging Risk:</strong> "{data.emergingRisk}" 
          is trending in {data.sector} media coverage.
        </p>

        <p style={emailStyles.text}>
          Our full 15-page report includes competitor benchmarking, AI visibility analysis 
          across 4 engines, and 12 prioritized recommendations.
        </p>

        <div style={emailStyles.blurSection}>
          <div style={{ filter: "blur(3px)", userSelect: "none", opacity: 0.7 }}>
            <p style={emailStyles.text}>
              Key Finding #3: {data.recipientCompany} is cited in only {Math.round(data.reputationScore * 0.15)} 
              out of 200 AI queries. {data.competitorName} appears in {Math.round(data.competitorScore * 0.2)} queries...
            </p>
            <p style={emailStyles.text}>
              Recommendation #1: Address the "{data.emergingRisk}" narrative within 48 hours by...
            </p>
          </div>
          <div style={emailStyles.blurCta}>
            <a href="/atelier/audit" style={emailStyles.ctaButton}>
              Get the full 15-page report →
            </a>
            <div style={emailStyles.ctaNote}>Free · No credit card · 7 days delivery</div>
          </div>
        </div>

        <p style={emailStyles.text}>Best regards,</p>
        <p style={emailStyles.signature}>
          <strong>Harch Atelier</strong><br />
          AI Reputation Intelligence<br />
          atelier@harchcorp.com · +212 684 440 682
        </p>
      </div>
    </div>
  );
}

// ─── WHATSAPP DAILY DIGEST TEMPLATE ──────────────────────────────
export function WhatsAppDigestTemplate({ 
  companyName, date, articles, positive, neutral, negative, 
  mentions, aiRank, alertTopic, alertIncrease, competitor 
}: {
  companyName: string; date: string; articles: number; positive: number;
  neutral: number; negative: number; mentions: number; aiRank: string;
  alertTopic: string; alertIncrease: number; competitor: string;
}) {
  return (
    <div style={whatsappStyles.container}>
      <div style={whatsappStyles.header}>
        <div style={whatsappStyles.botName}>Harch Intelligence</div>
        <div style={whatsappStyles.timestamp}>{date} · 07:00</div>
      </div>
      <div style={whatsappStyles.message}>
        <div style={whatsappStyles.messageTitle}>📊 {companyName} — Veille du {date}</div>
        <div style={whatsappStyles.messageSection}>
          <strong>Médias:</strong> {articles} articles ({positive} positifs, {neutral} neutres, {negative} négatifs)
        </div>
        <div style={whatsappStyles.messageSection}>
          <strong>Social:</strong> {mentions.toLocaleString()} mentions ({positive}% positif)
        </div>
        <div style={whatsappStyles.messageSection}>
          <strong>IA:</strong> ChatGPT vous cite {aiRank} sur "meilleure banque Maroc"
        </div>
        {alertIncrease > 30 && (
          <div style={whatsappStyles.alert}>
            ⚠️ Alerte: Sujet "{alertTopic}" en hausse (+{alertIncrease}% en 24h)
          </div>
        )}
        <div style={whatsappStyles.messageSection}>
          <strong>Concurrents:</strong> {competitor} #1 (+5pts)
        </div>
        <div style={whatsappStyles.link}>→ Dashboard complet: dashboard.harchcorp.com</div>
      </div>
      <div style={whatsappStyles.checks}>✓✓</div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────
const emailStyles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "600px", margin: "0 auto", background: "#FFFFFF", borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E5E5", fontFamily: "'Inter', sans-serif" },
  subject: { padding: "16px 24px", background: "#FAFAFA", borderBottom: "1px solid #E5E5E5", fontSize: "14px", color: "#525252" },
  body: { padding: "32px 24px" },
  text: { fontSize: "15px", lineHeight: 1.7, color: "#525252", marginBottom: "16px" },
  statBox: { background: "#FAFAFA", borderRadius: "6px", padding: "20px", margin: "20px 0", border: "1px solid #E5E5E5" },
  statRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F0F0F0" },
  statLabel: { fontSize: "14px", color: "#71717A" },
  statValue: { fontSize: "14px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace" },
  blurSection: { position: "relative", margin: "24px 0", padding: "24px", background: "#FAFAFA", borderRadius: "6px", border: "1px solid #E5E5E5" },
  blurCta: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" },
  ctaButton: { display: "inline-block", padding: "12px 28px", background: "#4A7B5F", color: "#FFFFFF", fontSize: "14px", fontWeight: 600, textDecoration: "none", borderRadius: "6px" },
  ctaNote: { fontSize: "11px", color: "#71717A", marginTop: "8px", fontFamily: "'JetBrains Mono', monospace" },
  signature: { fontSize: "14px", color: "#525252", lineHeight: 1.6, marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #E5E5E5" },
};

const whatsappStyles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "400px", margin: "0 auto", background: "#ECE5DD", borderRadius: "12px", overflow: "hidden", fontFamily: "'Inter', sans-serif", padding: "0" },
  header: { background: "#075E54", color: "#FFFFFF", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  botName: { fontSize: "15px", fontWeight: 600 },
  timestamp: { fontSize: "11px", opacity: 0.8 },
  message: { background: "#DCF8C6", margin: "12px", padding: "12px 16px", borderRadius: "8px", borderTopLeftRadius: "0", fontSize: "14px", color: "#1A1A1A", lineHeight: 1.5 },
  messageTitle: { fontWeight: 700, marginBottom: "8px" },
  messageSection: { marginBottom: "4px" },
  alert: { background: "rgba(160,82,75,0.1)", padding: "6px 10px", borderRadius: "4px", margin: "6px 0", color: "#A0524B", fontWeight: 600 },
  link: { color: "#075E54", fontSize: "13px", marginTop: "8px", textDecoration: "underline" },
  checks: { textAlign: "right", color: "#34B7F1", fontSize: "14px", padding: "0 16px 12px" },
};
