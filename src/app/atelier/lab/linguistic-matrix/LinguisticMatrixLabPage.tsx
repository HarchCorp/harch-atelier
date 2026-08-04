"use client";

import { AtelierNav } from "../../components/AtelierNav";
import { AtelierFooter } from "../../components/AtelierFooter";
import { LinguisticMatrixPanel } from "../../console/views/LinguisticMatrixPanel";
import { C } from "../../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  LINGUISTIC MATRIX LAB — public demo page
//
//  Shows the Harch IQ NLP Engine signature widget without requiring
//  login. Uses the demo data path (cascade scenario) so the GRI
//  gauge + cascade alert + 4-language matrix are all visible.
//
//  This is the page you show to a Dircom in a demo — no auth friction,
//  immediate visual impact.
// ═══════════════════════════════════════════════════════════════

export function LinguisticMatrixLabPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bgSubtle, fontFamily: C.fontSans }}>
      <AtelierNav />

      <main style={{ flex: 1, maxWidth: "1120px", margin: "0 auto", width: "100%", padding: "48px 24px" }}>
        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
            <span style={{
              fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
              padding: "4px 10px", borderRadius: "6px", background: C.bgHover, color: C.accent,
              border: `1px solid ${C.border}`,
            }}>
              HARCH IQ · NLP ENGINE
            </span>
            <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>
              — the definitive linguistic cartography
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 700, color: C.text,
            letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 12px",
          }}>
            Linguistic Intelligence Matrix.
            <br />
            <span style={{ color: C.accent }}>35 / 35 / 20 / 10.</span>
          </h1>
          <p style={{
            fontSize: "17px", color: C.textBody, lineHeight: 1.6, margin: 0, maxWidth: "680px",
          }}>
            La cartographie linguistique définitive de la rue numérique marocaine. Le monolinguisme n'existe pas chez notre cible ;
            le code-switching est permanent. Le moteur pondère chaque flux UGC selon cette volumétrie réelle — et détecte
            le moment exact où un bad buzz Darija traverse la membrane vers la presse mainstream.
          </p>
        </div>

        {/* The panel (uses public lab API endpoint — no auth required) */}
        <LinguisticMatrixPanel apiEndpoint="/api/lab/linguistic-matrix" />

        {/* Context section */}
        <section style={{ marginTop: "48px", padding: "32px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Why this matrix exists
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div>
              <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                The 2018 boycott pattern
              </div>
              <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, margin: 0 }}>
                Centrale Danone lost €150M. The bad buzz started on Facebook (Darija), amplified on WhatsApp (Darija),
                and crossed into mainstream press (MSA + French) 72 hours later. By then it was too late.
                The cascade detection catches that crossing in real-time.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                Why Darija is only 10%
              </div>
              <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, margin: 0 }}>
                Darija is 10% of the volume but 90% of the signal. It's where bad buzz starts — anonymous Hespress comments,
                TikTok threads, WhatsApp groups. The matrix over-indexes Darija on UGC and excludes it from formal articles
                (where it was polluting sentiment scores before).
              </p>
            </div>
            <div>
              <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                The Global Risk Index
              </div>
              <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, margin: 0 }}>
                A single 0-100 score weighted by the matrix. A Darija spike alone bumps the score. But when that spike
                crosses into MSA or French — the cascade alert fires critical. That's the moment the crisis leaves
                the underground and enters the institutional mainstream.
              </p>
            </div>
          </div>
        </section>
      </main>

      <div style={{ marginTop: "auto" }}>
        <AtelierFooter />
      </div>
    </div>
  );
}
