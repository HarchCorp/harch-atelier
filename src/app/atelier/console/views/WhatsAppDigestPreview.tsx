"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  WHATSAPP DIGEST PREVIEW
//
//  Shows exactly what the Dircom will receive on their phone at
//  07h00 every morning. Fetches REAL data from Neon via
//  /api/console/whatsapp-digest — the same data that would be
//  sent via Twilio WhatsApp Business API.
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
  const [digest, setDigest] = useState<{
    companyName: string;
    digestMessage: string;
    score: number;
    trend: string;
    mentionCount: number;
    sentiment: { positive: number; neutral: number; negative: number };
    negativeCount: number;
    topArticle: string | null;
    aiVisibility: { engine: string; score: number }[];
    date: string;
    source: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/console/whatsapp-digest")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setDigest(d); })
      .catch(() => {});
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const companyName = digest?.companyName || "HarchIQ";
  const score = digest?.score ?? 74;
  const trend = digest?.trend ?? "↓";
  const mentionCount = digest?.mentionCount ?? 0;
  const posPct = digest?.sentiment?.positive ?? 42;
  const neuPct = digest?.sentiment?.neutral ?? 28;
  const negPct = digest?.sentiment?.negative ?? 30;
  const negativeCount = digest?.negativeCount ?? 0;
  const topArticle = digest?.topArticle ?? "N/A";
  const aiVis = digest?.aiVisibility ?? [{engine:"ChatGPT",score:72},{engine:"Claude",score:68},{engine:"Gemini",score:64}];
  const dateStr = digest?.date ?? now.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const source = digest?.source ?? "demo";

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
                📊 Daily Digest · {dateStr}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>Score réputation:</strong> {score}/100 <span style={{ color: trend === "↑" ? C.cta : C.danger }}>{trend}</span>
                {source === "neon" && <span style={{ fontSize: "10px", color: C.textMuted, marginLeft: "4px" }}>(réel)</span>}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>Mentions 24h:</strong> {mentionCount.toLocaleString()}
                <br />
                <span style={{ fontSize: "12px", color: C.textSec }}>
                  {"▓".repeat(Math.round(posPct/10))}{"░".repeat(10 - Math.round(posPct/10))} {posPct}% positif
                  <br />
                  {"▓".repeat(Math.round(neuPct/10))}{"░".repeat(10 - Math.round(neuPct/10))} {neuPct}% neutre
                  <br />
                  {"▓".repeat(Math.round(negPct/10))}{"░".repeat(10 - Math.round(negPct/10))} {negPct}% négatif
                </span>
              </div>

              {negativeCount > 5 && (
                <div style={{ marginBottom: "8px", padding: "8px", background: "#fff", borderRadius: "6px", border: `1px solid ${C.danger}30` }}>
                  <strong style={{ color: C.danger }}>⚠ {negativeCount} articles négatifs en 24h</strong>
                  <br />
                  <span style={{ fontSize: "12px" }}>{topArticle?.slice(0, 60)}</span>
                </div>
              )}

              <div style={{ marginBottom: "8px" }}>
                <strong>Top article:</strong> {topArticle?.slice(0, 50)}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>AI Visibility:</strong> {aiVis.map(a => `${a.engine} ${a.score}`).join(" · ")}
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
