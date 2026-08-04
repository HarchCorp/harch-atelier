"use client";

// ═══════════════════════════════════════════════════════════════
//  WHATSAPP DIGEST PREVIEW
//
//  Shows exactly what the Dircom will receive on their phone at
//  07h00 every morning. This is the killer delivery channel —
//  the Dircom sees this preview in the console and knows it's
//  what lands on their WhatsApp.
//
//  Pattern: phone mockup with WhatsApp chat bubble.
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
  whatsappGreen: "#25D366",
  whatsappBg: "#ECE5DD",
  whatsappBubble: "#DCF8C6",
};

export function WhatsAppDigestPreview() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
          WhatsApp Daily Digest
        </div>
        <div style={{ fontSize: "13px", color: C.textSec }}>
          Aperçu du message envoyé chaque matin à 07h00
        </div>
      </div>

      {/* Phone mockup */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "320px",
            background: C.whatsappBg,
            borderRadius: "24px",
            padding: "0",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: `8px solid ${C.text}`,
          }}
        >
          {/* WhatsApp header bar */}
          <div
            style={{
              background: "#075E54",
              color: "#fff",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.whatsappGreen, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>◉</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>HarchIQ</div>
              <div style={{ fontSize: "10px", opacity: 0.8 }}>en ligne · Daily Digest</div>
            </div>
            <span style={{ marginLeft: "auto", fontFamily: C.fontMono, fontSize: "10px", opacity: 0.8 }}>{timeStr}</span>
          </div>

          {/* Chat area */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Date separator */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, background: "#fff", padding: "2px 10px", borderRadius: "8px" }}>
                AUJOURD'HUI
              </span>
            </div>

            {/* Digest message */}
            <div
              style={{
                background: C.whatsappBubble,
                borderRadius: "12px",
                borderTopLeftRadius: "2px",
                padding: "12px 14px",
                maxWidth: "90%",
                fontSize: "13px",
                lineHeight: 1.5,
                color: C.text,
                fontFamily: C.fontSans,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "8px", color: "#075E54" }}>
                📊 Daily Digest · {now.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>Score réputation:</strong> 74/100 <span style={{ color: C.danger }}>↓ 3pts</span>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>Mentions 24h:</strong> 1,247
                <br />
                <span style={{ fontSize: "12px", color: C.textSec }}>
                  ▓▓▓▓▓▓▓░░ 42% positif
                  <br />
                  ▓▓▓▓░░░░░ 28% neutre
                  <br />
                  ▓▓▓▓▓▓░░░ 30% négatif
                </span>
              </div>

              <div style={{ marginBottom: "8px", padding: "8px", background: "#fff", borderRadius: "6px", border: `1px solid ${C.danger}30` }}>
                <strong style={{ color: C.danger }}>⚠ ALERTE CRITIQUE</strong>
                <br />
                <span style={{ fontSize: "12px" }}>
                  Bad buzz "Frais bancaires" — Darija → MSA+FR
                  <br />
                  Vélocité: 35/h · 65% négatif
                </span>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>Top narrative:</strong> "Frais bancaires excessifs" ↑ rising
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>AI Visibility:</strong> ChatGPT 72 · Claude 68 · Gemini 64
              </div>

              <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "8px" }}>
                — HarchIQ · /atelier/console pour le détail
              </div>
            </div>

            {/* Delivery indicator */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: C.textMuted }}>07:00</span>
              <span style={{ color: C.whatsappGreen, fontSize: "12px" }}>✓✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div style={{ marginTop: "16px", padding: "12px 14px", background: C.surfaceAlt, borderRadius: "8px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "16px" }}>📲</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>Livré chaque matin à 07h00</div>
          <div style={{ fontSize: "12px", color: C.textSec }}>Aux destinataires configurés · taux d'ouverture {">"}90% au Maroc</div>
        </div>
      </div>
    </div>
  );
}
